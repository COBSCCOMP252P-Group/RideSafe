# routes/route_optimizer.py

from fastapi import APIRouter, HTTPException
from sqlalchemy.future import select
from sqlalchemy import delete
from datetime import date
from math import radians, sin, cos, sqrt, atan2
from typing import List

from ortools.constraint_solver import pywrapcp, routing_enums_pb2

from database import async_session

from models.route import Route
from models.route_stop import RouteStop
from models.student import Student
from models.location import Location
from models.student_fixed_location import StudentFixedLocation
from models.student_temp_location import StudentTempLocation

router = APIRouter(
    prefix="/route-optimizer",
    tags=["Smart Route Optimizer"]
)

# ==========================================================
# CONFIG
# ==========================================================
DEFAULT_BUS_CAPACITY = 40


# ==========================================================
# HELPERS
# ==========================================================
def haversine(lat1, lon1, lat2, lon2):
    """
    Distance in KM
    """
    R = 6371

    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)

    a = (
        sin(dlat / 2) ** 2
        + cos(radians(lat1))
        * cos(radians(lat2))
        * sin(dlon / 2) ** 2
    )

    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    return R * c


# ==========================================================
# BUILD STUDENT LOCATION DATA
# temp overrides permanent
# ==========================================================
async def build_student_points(session, target_date: date):

    result = await session.execute(
        select(Student).where(Student.status == "active")
    )

    students = result.scalars().all()

    all_points = []

    for student in students:

        # ------------------------------------------
        # TEMP LOCATIONS
        # ------------------------------------------
        temp_result = await session.execute(
            select(StudentTempLocation).where(
                StudentTempLocation.student_id == student.student_id,
                StudentTempLocation.date == target_date
            )
        )

        temp_rows = temp_result.scalars().all()

        temp_pickup = None
        temp_dropoff = None

        for row in temp_rows:
            if row.type == "pickup":
                temp_pickup = row
            elif row.type == "dropoff":
                temp_dropoff = row

        # ------------------------------------------
        # PERMANENT LOCATIONS
        # ------------------------------------------
        perm_result = await session.execute(
            select(StudentFixedLocation).where(
                StudentFixedLocation.student_id == student.student_id
            )
        )

        perm_rows = perm_result.scalars().all()

        perm_pickup = None
        perm_dropoff = None

        for row in perm_rows:
            if row.type == "pickup":
                perm_pickup = row
            elif row.type == "dropoff":
                perm_dropoff = row

        # temp overrides permanent
        final_pickup = temp_pickup if temp_pickup else perm_pickup
        final_dropoff = temp_dropoff if temp_dropoff else perm_dropoff

        # ------------------------------------------
        # PICKUP
        # ------------------------------------------
        if final_pickup:
            loc = await session.get(Location, final_pickup.location_id)

            if loc:
                all_points.append({
                    "student_id": student.student_id,
                    "student_name": student.full_name,
                    "mode": "pickup",
                    "latitude": float(loc.latitude),
                    "longitude": float(loc.longitude),
                    "priority": 1 if perm_pickup and not temp_pickup else 2
                })

        # ------------------------------------------
        # DROPOFF
        # ------------------------------------------
        if final_dropoff:
            loc = await session.get(Location, final_dropoff.location_id)

            if loc:
                all_points.append({
                    "student_id": student.student_id,
                    "student_name": student.full_name,
                    "mode": "dropoff",
                    "latitude": float(loc.latitude),
                    "longitude": float(loc.longitude),
                    "priority": 1 if perm_dropoff and not temp_dropoff else 2
                })

    return all_points


# ==========================================================
# ORTOOLS SOLVER
# ==========================================================
def solve_vrp(route, points):
    """
    Single route optimization:
    depot = route start location
    returns ordered student points
    """

    if not points:
        return []

    # Node 0 = depot/start
    nodes = [{
        "latitude": route.start_lat,
        "longitude": route.start_lon,
        "student_id": None,
        "student_name": "Depot"
    }] + points

    size = len(nodes)

    # ----------------------------------------------
    # Distance Matrix (meters)
    # ----------------------------------------------
    matrix = []

    for i in range(size):
        row = []

        for j in range(size):
            dist = haversine(
                nodes[i]["latitude"],
                nodes[i]["longitude"],
                nodes[j]["latitude"],
                nodes[j]["longitude"]
            )

            row.append(int(dist * 1000))

        matrix.append(row)

    # ----------------------------------------------
    # Manager / Routing
    # ----------------------------------------------
    manager = pywrapcp.RoutingIndexManager(size, 1, 0)

    routing = pywrapcp.RoutingModel(manager)

    def distance_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return matrix[from_node][to_node]

    transit_index = routing.RegisterTransitCallback(distance_callback)

    routing.SetArcCostEvaluatorOfAllVehicles(transit_index)

    # ----------------------------------------------
    # Search Parameters
    # ----------------------------------------------
    search = pywrapcp.DefaultRoutingSearchParameters()

    search.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    )

    search.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    )

    search.time_limit.seconds = 3

    solution = routing.SolveWithParameters(search)

    if not solution:
        return points

    # ----------------------------------------------
    # Extract route order
    # ----------------------------------------------
    ordered = []

    index = routing.Start(0)

    while not routing.IsEnd(index):
        node = manager.IndexToNode(index)

        if node != 0:
            ordered.append(nodes[node])

        index = solution.Value(routing.NextVar(index))

    return ordered


# ==========================================================
# ASSIGN STUDENTS TO BEST ROUTE
# ==========================================================
def assign_students_to_routes(routes, points):
    """
    Assign student to nearest route start.
    Capacity enforced.
    Permanent priority first.
    """

    buckets = {r.route_id: [] for r in routes}

    ordered_points = sorted(points, key=lambda x: x["priority"])

    for point in ordered_points:

        best_route = None
        best_dist = float("inf")

        for route in routes:

            if len(buckets[route.route_id]) >= DEFAULT_BUS_CAPACITY:
                continue

            d = haversine(
                route.start_lat,
                route.start_lon,
                point["latitude"],
                point["longitude"]
            )

            if d < best_dist:
                best_dist = d
                best_route = route

        if best_route:
            buckets[best_route.route_id].append(point)

    return buckets


# ==========================================================
# MAIN ENDPOINT
# ==========================================================
@router.post("/generate")
async def generate_routes(target_date: date = date.today()):

    async with async_session() as session:

        # --------------------------------------------------
        # CLEAR OLD ROUTE STOPS
        # --------------------------------------------------
        await session.execute(delete(RouteStop))

        # --------------------------------------------------
        # LOAD ROUTES
        # --------------------------------------------------
        result = await session.execute(select(Route))
        routes = result.scalars().all()

        if not routes:
            raise HTTPException(404, "No routes found")

        usable_routes = []

        for route in routes:

            start_loc = await session.get(
                Location,
                route.start_point_location
            )

            if not start_loc:
                continue

            route.start_lat = float(start_loc.latitude)
            route.start_lon = float(start_loc.longitude)

            usable_routes.append(route)

        if not usable_routes:
            raise HTTPException(404, "No usable routes found")

        # --------------------------------------------------
        # BUILD STUDENT LOCATIONS
        # --------------------------------------------------
        all_points = await build_student_points(session, target_date)

        if not all_points:
            await session.commit()
            return {
                "message": "No active student locations found"
            }

        summary = []

        # --------------------------------------------------
        # MORNING + EVENING
        # --------------------------------------------------
        for mode in ["morning", "evening"]:

            mode_routes = [
                r for r in usable_routes
                if r.type.lower() == mode
            ]

            if not mode_routes:
                continue

            wanted = "pickup" if mode == "morning" else "dropoff"

            mode_points = [
                p for p in all_points
                if p["mode"] == wanted
            ]

            if not mode_points:
                continue

            # ----------------------------------------------
            # ASSIGN TO ROUTES
            # ----------------------------------------------
            buckets = assign_students_to_routes(
                mode_routes,
                mode_points
            )

            # ----------------------------------------------
            # OPTIMIZE EACH ROUTE USING ORTOOLS
            # ----------------------------------------------
            for route in mode_routes:

                assigned = buckets[route.route_id]

                if not assigned:
                    continue

                ordered = solve_vrp(route, assigned)

                order_no = 1

                for p in ordered:

                    stop = RouteStop(
                        route_id=route.route_id,
                        stop_name=f"{p['student_name']} ({p['student_id']})",
                        latitude=p["latitude"],
                        longitude=p["longitude"],
                        stop_order=order_no
                    )

                    session.add(stop)
                    order_no += 1

                summary.append({
                    "route_id": route.route_id,
                    "route_name": route.route_name,
                    "type": route.type,
                    "assigned_students": len(ordered)
                })

        # --------------------------------------------------
        # SAVE
        # --------------------------------------------------
        await session.commit()

        return {
            "message": "Smart routes generated successfully",
            "date": str(target_date),
            "routes": summary
        }