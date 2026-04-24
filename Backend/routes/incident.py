from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import desc
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError

from database import async_session
from models.driver import Driver
from models.route import Route
from models.incidents import Incident, IncidentType
from models.sos_alert import SOSAlert

router = APIRouter(tags=["incident-sos"])


class IncidentCreate(BaseModel):
    reported_by: int
    route_id: Optional[int] = None
    description: str
    type: str
    severity: Optional[str] = None


class IncidentResponse(BaseModel):
    incident_id: int
    reported_by: int
    route_id: int
    description: Optional[str] = None
    type: IncidentType
    severity: Optional[str] = None
    reported_at: datetime

    class Config:
        from_attributes = True


class SOSCreate(BaseModel):
    driver_id: int
    bus_id: Optional[int] = None
    latitude: Decimal
    longitude: Decimal


class SOSResponse(BaseModel):
    sos_id: int
    driver_id: int
    bus_id: int
    latitude: Decimal
    longitude: Decimal
    triggered_at: datetime
    resolved_status: bool

    class Config:
        from_attributes = True


class SOSStatusUpdate(BaseModel):
    status: str


@router.post("/incident", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
async def create_incident(payload: IncidentCreate):
    async with async_session() as session:
        driver_result = await session.execute(
            select(Driver).where(Driver.driver_id == payload.reported_by)
        )
        driver = driver_result.scalar_one_or_none()

        if not driver:
            # Frontend currently stores logged-in user_id, not driver_id.
            driver_result = await session.execute(
                select(Driver).where(Driver.user_id == payload.reported_by)
            )
            driver = driver_result.scalar_one_or_none()

        if not driver:
            raise HTTPException(status_code=404, detail="Driver not found")

        route_id = payload.route_id
        if route_id is not None:
            route_result = await session.execute(
                select(Route).where(Route.route_id == route_id)
            )
            route = route_result.scalar_one_or_none()

            if not route:
                raise HTTPException(status_code=404, detail="Route not found")
        else:
            route_result = await session.execute(
                select(Route)
                .where(Route.driver_id == driver.driver_id)
                .order_by(desc(Route.route_id))
            )
            route = route_result.scalars().first()

            if not route:
                raise HTTPException(status_code=404, detail="No route found for driver")

            route_id = route.route_id

        normalized_type = payload.type.strip().upper()
        if normalized_type in {"DELAY", "TRAFFIC"}:
            incident_type = IncidentType.DELAY
        else:
            incident_type = IncidentType.INCIDENT

        incident = Incident(
            reported_by=driver.driver_id,
            route_id=route_id,
            description=payload.description,
            type=incident_type,
            severity=payload.severity,
        )

        session.add(incident)
        try:
            await session.commit()
        except IntegrityError as exc:
            await session.rollback()
            raise HTTPException(status_code=400, detail=f"Could not save incident: {str(exc.orig)}")
        await session.refresh(incident)

        return incident


@router.get("/incident", response_model=List[IncidentResponse])
async def get_incidents():
    async with async_session() as session:
        result = await session.execute(
            select(Incident).order_by(desc(Incident.reported_at))
        )
        return result.scalars().all()


@router.post("/sos", response_model=SOSResponse, status_code=status.HTTP_201_CREATED)
async def trigger_sos(payload: SOSCreate):
    async with async_session() as session:
        driver_result = await session.execute(
            select(Driver).where(Driver.driver_id == payload.driver_id)
        )
        driver = driver_result.scalar_one_or_none()

        if not driver:
            # Frontend stores logged-in user_id; accept that as input too.
            driver_result = await session.execute(
                select(Driver).where(Driver.user_id == payload.driver_id)
            )
            driver = driver_result.scalar_one_or_none()

        if not driver:
            raise HTTPException(status_code=404, detail="Driver not found")

        bus_id = payload.bus_id
        if bus_id is None:
            route_result = await session.execute(
                select(Route)
                .where(Route.driver_id == driver.driver_id)
                .order_by(desc(Route.route_id))
            )
            route = route_result.scalars().first()

            # Temporary fallback: keep SOS usable even when route/bus mapping is incomplete.
            bus_id = route.bus_id if route and route.bus_id else 1

        sos_alert = SOSAlert(
            driver_id=driver.driver_id,
            bus_id=bus_id,
            latitude=payload.latitude,
            longitude=payload.longitude,
            resolved_status=False,
        )

        session.add(sos_alert)
        await session.commit()
        await session.refresh(sos_alert)

        return sos_alert


@router.get("/sos", response_model=List[SOSResponse])
async def get_sos_alerts(driver_id: Optional[int] = Query(default=None)):
    async with async_session() as session:
        query = select(SOSAlert)

        if driver_id is not None:
            driver_result = await session.execute(
                select(Driver).where(Driver.driver_id == driver_id)
            )
            driver = driver_result.scalar_one_or_none()

            if not driver:
                driver_result = await session.execute(
                    select(Driver).where(Driver.user_id == driver_id)
                )
                driver = driver_result.scalar_one_or_none()

            if not driver:
                return []

            query = query.where(SOSAlert.driver_id == driver.driver_id)

        result = await session.execute(
            query.order_by(desc(SOSAlert.triggered_at))
        )
        return result.scalars().all()


@router.put("/sos/{sos_id}/status", response_model=SOSResponse)
async def update_sos_status(sos_id: int, payload: SOSStatusUpdate):
    async with async_session() as session:
        result = await session.execute(
            select(SOSAlert).where(SOSAlert.sos_id == sos_id)
        )
        sos_alert = result.scalar_one_or_none()

        if not sos_alert:
            raise HTTPException(status_code=404, detail="SOS alert not found")

        normalized_status = payload.status.strip().upper()
        if normalized_status in {"DONE", "RESOLVED"}:
            sos_alert.resolved_status = True
        elif normalized_status in {"WORKING", "OPEN"}:
            sos_alert.resolved_status = False
        else:
            raise HTTPException(status_code=400, detail="Invalid status. Use WORKING or DONE")

        await session.commit()
        await session.refresh(sos_alert)

        return sos_alert


@router.put("/sos/{sos_id}/resolve", response_model=SOSResponse)
async def resolve_sos(sos_id: int):
    async with async_session() as session:
        result = await session.execute(
            select(SOSAlert).where(SOSAlert.sos_id == sos_id)
        )
        sos_alert = result.scalar_one_or_none()

        if not sos_alert:
            raise HTTPException(status_code=404, detail="SOS alert not found")

        sos_alert.resolved_status = True

        await session.commit()
        await session.refresh(sos_alert)

        return sos_alert
