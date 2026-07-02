from fastapi import APIRouter, HTTPException
from sqlalchemy.future import select
from datetime import datetime

from database import async_session

from models.route import Route
from models.route_stop import RouteStop
from models.student import Student
from models.location import Location

router = APIRouter(
    prefix="/routes",
    tags=["Routes"]
)

# ==========================================================
# HELPERS
# ==========================================================
def get_current_route_type():
    now = datetime.now()
    return "evening" if now.hour >= 12 else "morning"


# ==========================================================
# SAFE LOCATION PARSER
# ==========================================================
def parse_location(location):
    if not location:
        return None

    # dict format
    if isinstance(location, dict):
        return {
            "lat": float(location.get("lat", 0)),
            "lng": float(location.get("lng", 0))
        }

    # tuple/list format
    if isinstance(location, (list, tuple)) and len(location) == 2:
        return {
            "lat": float(location[0]),
            "lng": float(location[1])
        }

    # string format "lat,lng"
    if isinstance(location, str) and "," in location:
        lat, lng = location.split(",")
        return {"lat": float(lat), "lng": float(lng)}

    return None


# ==========================================================
# BUILD CLEAN ROUTE (START → STOPS → END)
# ==========================================================
async def get_route_with_stops(session, route_obj):
    result = await session.execute(
        select(RouteStop)
        .where(RouteStop.route_id == route_obj.route_id)
        .order_by(RouteStop.stop_order.asc())
    )

    stops = result.scalars().all()

    route_points = []

    # ------------------
    # START POINT
    # ------------------
    result1 = await session.execute(
        select(Location)
        .where(Location.location_id == route_obj.start_point_location)
    )
    start = result1.scalar_one_or_none()
    if start:
        route_points.append({
            "type": "start",
            "stop_name": "Start Point",
            "latitude": start.latitude,
            "longitude": start.longitude
        })

    # ------------------
    # MIDDLE STOPS
    # ------------------
    for s in stops:
        route_points.append({
            "type": "stop",
            "stop_id": s.stop_id,
            "stop_name": s.stop_name,
            "latitude": float(s.latitude),
            "longitude": float(s.longitude),
            "stop_order": s.stop_order
        })

    # ------------------
    # END POINT
    # ------------------
    result2 = await session.execute(
        select(Location)
        .where(Location.location_id == route_obj.end_point_location)
    )
    end = result2.scalar_one_or_none()
    if end:
        route_points.append({
            "type": "end",
            "stop_name": "End Point",
            "latitude": end.latitude,
            "longitude": end.longitude
        })

    return {
        "route_id": route_obj.route_id,
        "route_name": route_obj.route_name,
        "bus_id": route_obj.bus_id,
        "driver_id": route_obj.driver_id,
        "type": route_obj.type,
        "route_stops": route_points
    }


# ==========================================================
# GET ALL ROUTES
# ==========================================================
@router.get("/")
async def get_all_routes():
    async with async_session() as session:
        result = await session.execute(select(Route))
        routes = result.scalars().all()

        return [
            await get_route_with_stops(session, route)
            for route in routes
        ]


# ==========================================================
# GET ROUTE BY ROUTE ID
# ==========================================================
@router.get("/{route_id}")
async def get_route_by_id(route_id: int):
    async with async_session() as session:
        route = await session.get(Route, route_id)

        if not route:
            raise HTTPException(404, "Route not found")

        return await get_route_with_stops(session, route)


# ==========================================================
# GET ROUTE BY STUDENT ID
# ==========================================================
@router.get("/student/{student_id}")
async def get_route_for_student(student_id: int):
    route_type = get_current_route_type()

    async with async_session() as session:

        student = await session.get(Student, student_id)
        if not student:
            raise HTTPException(404, "Student not found")

        result = await session.execute(
            select(Route).where(Route.type == route_type)
        )

        routes = result.scalars().all()

        for route in routes:
            result2 = await session.execute(
                select(RouteStop).where(RouteStop.route_id == route.route_id)
            )

            stops = result2.scalars().all()

            # NOTE: still your logic (can improve later)
            for stop in stops:
                if str(student.full_name) in stop.stop_name:
                    return await get_route_with_stops(session, route)

        raise HTTPException(404, "No route found for student")


# ==========================================================
# GET ROUTE BY DRIVER ID
# ==========================================================
@router.get("/driver/{driver_id}")
async def get_route_for_driver(driver_id: int):
    route_type = get_current_route_type()

    async with async_session() as session:

        result = await session.execute(
            select(Route).where(
                Route.driver_id == driver_id,
                Route.type == route_type
            )
        )

        route = result.scalar_one_or_none()

        if not route:
            raise HTTPException(404, "No route found for driver")

        return await get_route_with_stops(session, route)