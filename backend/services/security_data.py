import random
from datetime import datetime, timedelta

# UK Cities with coordinates
UK_SITES = [
    ("London HQ", "123 Victoria Street, London", 51.4975, -0.1357),
    ("Manchester Depot", "45 Deansgate, Manchester", 53.4808, -2.2426),
    ("Birmingham Centre", "78 Bull Street, Birmingham", 52.4862, -1.8904),
    ("Leeds Office", "12 Park Row, Leeds", 53.7997, -1.5492),
    ("Glasgow Hub", "56 Buchanan Street, Glasgow", 55.8642, -4.2518),
    ("Liverpool Warehouse", "89 Albert Dock, Liverpool", 53.4084, -2.9916),
    ("Bristol Site", "34 Harbourside, Bristol", 51.4545, -2.5879),
    ("Sheffield Complex", "67 Fargate, Sheffield", 53.3811, -1.4701),
    ("Edinburgh Branch", "23 Princes Street, Edinburgh", 55.9533, -3.1883),
    ("Cardiff Facility", "91 St Mary Street, Cardiff", 51.4816, -3.1791),
]

# Pool of security officers
OFFICERS = [
    "James Wilson", "Sarah Thompson", "Michael Brown", "Emma Davies", "David Taylor",
    "Sophie Clark", "Daniel Harris", "Lucy Robinson", "Thomas Wright", "Olivia Hall",
    "William Green", "Charlotte Lewis", "Harry Walker", "Amelia Young", "George King",
    "Mia Scott", "Jack Adams", "Emily Baker", "Oliver Turner", "Isla Mitchell",
]

# Checkpoint name prefixes and locations
CHECKPOINT_PREFIXES = [
    "Reception", "Main Entrance", "Loading Bay", "Server Room", "Storage Area",
    "Emergency Exit L1", "Emergency Exit L2", "Emergency Exit G", "Stairwell A", "Stairwell B",
    "Parking Level 1", "Parking Level 2", "Roof Access", "HVAC Room", "Electrical Room",
    "Conference Room A", "Conference Room B", "Kitchen Area", "Break Room", "Mail Room",
    "Warehouse Section A", "Warehouse Section B", "Warehouse Section C", "Office Wing East",
    "Office Wing West", "Executive Floor", "IT Department", "HR Department", "Finance Area",
    "Lobby North", "Lobby South", "Cafeteria", "Gym Facility", "Locker Room",
    "Archive Room", "Print Room", "Security Office", "Maintenance Bay", "Generator Room",
    "Fire Panel Room", "Comms Room", "Meeting Room 1", "Meeting Room 2", "Training Room",
    "Visitor Centre", "Gate House", "Perimeter Fence North", "Perimeter Fence South",
    "Perimeter Fence East", "Perimeter Fence West", "Delivery Entrance", "Staff Entrance",
]

# Checkpoint description details
CHECKPOINT_DETAILS = [
    "Pillar left of entrance", "Door frame, inside right", "Wall panel near window",
    "Column by elevator", "Stairwell landing", "Fire extinguisher station",
    "Emergency light fixture", "Security camera mount", "Access control panel",
    "Utility box cover", "Ventilation grate", "Sprinkler control valve",
    "Electrical junction box", "Smoke detector housing", "Exit sign bracket",
    "Window sill, east side", "Door handle, interior", "Wall mounted cabinet",
    "Equipment rack side panel", "Ceiling tile frame", "Floor mounted post",
]

# Deviation actions (50+)
DEVIATION_ACTIONS = [
    "Close open window", "Turn off lights", "Lock unlocked gate", "Lock unlocked door",
    "Clear blocked emergency exit", "Report missing fire extinguisher",
    "Secure loose equipment", "Close open cabinet", "Turn off running tap",
    "Reset triggered alarm", "Report broken window", "Report damaged lock",
    "Remove obstruction from pathway", "Secure open roof hatch", "Close fire door",
    "Report water leak", "Report gas smell", "Turn off unattended equipment",
    "Secure loading bay door", "Report graffiti", "Remove unauthorized signage",
    "Report damaged CCTV camera", "Secure server room door", "Report faulty lighting",
    "Clear debris from entrance", "Report damaged fence section", "Secure vehicle gate",
    "Report suspicious package", "Remove abandoned items", "Report broken glass",
    "Secure storage container", "Report overflowing bin", "Turn off alarm",
    "Secure electrical panel", "Report pest sighting", "Clear blocked drain",
    "Report damaged pavement", "Secure chemical storage", "Report faulty sensor",
    "Remove trip hazard", "Secure archive room", "Report AC malfunction",
    "Secure vending area", "Report elevator issue", "Clear fire escape route",
    "Report damaged handrail", "Secure bike storage", "Report blocked access",
    "Turn off heating unit", "Secure postal area",
]

# Serious incident templates for detailed comments
SERIOUS_INCIDENTS = [
    "Discovered evidence of attempted break-in at {location}. {details} The door frame showed signs of forced entry with tool marks visible on the lock mechanism. Area secured and photographed. {police_action}",
    "Found signs of vandalism at {location}. {details} Graffiti tags spray-painted on the wall, approximately 2m x 1m in size. Documented with photographs and reported to site management. {police_action}",
    "Observed suspicious individual loitering near {location}. {details} Male, approximately 30-40 years old, dark clothing, acting nervously and checking door handles. Individual fled when approached. {police_action}",
    "Discovered broken window at {location}. {details} Glass fragments scattered both inside and outside suggesting external force. No items appear to be missing from immediate area. {police_action}",
    "Found evidence of rough sleeping at {location}. {details} Bedding materials, food wrappers, and personal effects discovered in secluded corner. Area was unoccupied at time of discovery. {police_action}",
    "Witnessed altercation between two individuals near {location}. {details} Verbal argument escalated briefly but parties separated before physical contact. Both individuals left the premises. {police_action}",
    "Discovered damaged CCTV equipment at {location}. {details} Camera housing forcibly removed and cables cut. Appears deliberate rather than weather damage. {police_action}",
    "Found unauthorized access attempt at {location}. {details} Access card reader showed multiple failed attempts from unknown card. Electronic logs preserved for investigation. {police_action}",
    "Observed vehicle acting suspiciously in {location}. {details} Dark coloured van circling the area multiple times, slowing near entrances. Registration noted and reported. {police_action}",
    "Discovered fire safety equipment tampered with at {location}. {details} Fire extinguisher discharged and emergency exit signage removed. Potentially deliberate sabotage. {police_action}",
]

INCIDENT_DETAILS = [
    "Incident occurred at approximately {time}.",
    "Discovery made during routine checkpoint inspection.",
    "Area had been secure during previous patrol.",
    "No witnesses present at time of discovery.",
    "Adjacent areas appeared undisturbed.",
    "Weather conditions were clear at time of incident.",
    "CCTV footage requested from control room.",
    "Site supervisor notified immediately.",
]

POLICE_ACTIONS = [
    "Police contacted and incident reference {ref} obtained. Officers attended and took statements.",
    "Police contacted on 101 non-emergency line. Reference {ref} issued for follow-up.",
    "Due to nature of incident, 999 called. Police arrived within 15 minutes. Crime reference {ref}.",
    "Incident logged with police online reporting. Reference {ref} for insurance purposes.",
    "Police advised no attendance required but reference {ref} provided for records.",
]


def generate_time_in_range(start_hour, start_min, end_hour, end_min):
    """Generate a random time within a range, handling overnight spans."""
    start_mins = start_hour * 60 + start_min
    end_mins = end_hour * 60 + end_min

    if end_mins < start_mins:  # Overnight
        end_mins += 24 * 60

    random_mins = random.randint(start_mins, end_mins)
    if random_mins >= 24 * 60:
        random_mins -= 24 * 60

    return random_mins // 60, random_mins % 60


def parse_time(time_str):
    """Parse HH:MM string to hours and minutes."""
    parts = time_str.split(":")
    return int(parts[0]), int(parts[1])


def time_to_minutes(hour, minute):
    """Convert time to minutes from midnight."""
    return hour * 60 + minute


def generate_patrol_specs_for_site(site_id):
    """Generate 1-3 non-overlapping patrol specifications for a site."""
    num_specs = random.randint(1, 3)
    specs = []

    # Available night shift window: 18:00 to 05:00 (next day)
    # We need to fit specs with 1h gap between them
    # Each spec window is 10 mins to 2 hours

    # Convert to minutes from 18:00 as base
    available_start = 0  # 18:00
    available_end = 11 * 60  # 05:00 next day = 11 hours from 18:00

    current_time = available_start

    for i in range(num_specs):
        if current_time >= available_end - 60:  # Not enough time left
            break

        # Window size: mostly 1-2 hours, sometimes 10-30 mins
        if random.random() < 0.2:  # 20% chance of short window
            window_size = random.randint(10, 30)
        else:
            window_size = random.randint(60, 120)

        # Earliest start time
        earliest_mins = current_time
        latest_mins = earliest_mins + window_size

        # Make sure we don't exceed available time
        if latest_mins > available_end:
            latest_mins = available_end
            window_size = latest_mins - earliest_mins

        # Convert back to actual time
        earliest_hour = (18 + earliest_mins // 60) % 24
        earliest_min = earliest_mins % 60
        latest_hour = (18 + latest_mins // 60) % 24
        latest_min = latest_mins % 60

        earliest_str = f"{earliest_hour:02d}:{earliest_min:02d}"
        latest_str = f"{latest_hour:02d}:{latest_min:02d}"

        # Description based on time
        if earliest_hour < 21:
            desc = "Evening patrol"
        elif earliest_hour < 24:
            desc = "Night patrol"
        else:
            desc = "Early morning patrol"

        specs.append({
            "id": len(specs) + 1,  # Will be reassigned globally later
            "site_id": site_id,
            "description": f"{desc} - Round {i + 1}",
            "earliest_start": earliest_str,
            "latest_start": latest_str,
        })

        # Move current time: latest + 1 hour gap
        current_time = latest_mins + 60

    return specs


def generate_checkpoints_for_spec(spec_id, site_name):
    """Generate 10-50 checkpoints for a patrol specification."""
    num_checkpoints = random.randint(10, 50)
    checkpoints = []

    # Select random prefixes
    selected_prefixes = random.sample(CHECKPOINT_PREFIXES, min(num_checkpoints, len(CHECKPOINT_PREFIXES)))

    # If we need more, add numbered variants
    while len(selected_prefixes) < num_checkpoints:
        base = random.choice(CHECKPOINT_PREFIXES)
        num = len([p for p in selected_prefixes if p.startswith(base)]) + 1
        selected_prefixes.append(f"{base} {num}")

    for i, prefix in enumerate(selected_prefixes[:num_checkpoints]):
        detail = random.choice(CHECKPOINT_DETAILS)
        checkpoints.append({
            "id": i + 1,  # Will be reassigned globally later
            "spec_id": spec_id,
            "name": prefix,
            "description": f"{prefix} - {detail}",
        })

    return checkpoints


def generate_serious_comment(checkpoint_name, timestamp):
    """Generate a detailed comment for a serious deviation."""
    template = random.choice(SERIOUS_INCIDENTS)
    detail = random.choice(INCIDENT_DETAILS)

    # 70% chance police were involved
    if random.random() < 0.7:
        police = random.choice(POLICE_ACTIONS).format(ref=f"CR{random.randint(10000, 99999)}")
    else:
        police = "Incident documented for site management review."

    comment = template.format(
        location=checkpoint_name,
        details=detail.format(time=timestamp.strftime("%H:%M")),
        police_action=police
    )

    return comment


def generate_security_data():
    """Generate the complete security patrolling dataset."""
    random.seed(100)  # For reproducibility

    # Generate sites
    sites = []
    for i, (name, address, lat, lon) in enumerate(UK_SITES, start=1):
        sites.append({
            "id": i,
            "name": name,
            "customer": "Acme Corp",
            "address": address,
            "lon": lon,
            "lat": lat,
        })

    # Generate patrol specifications
    patrol_specs = []
    spec_id_counter = 1
    for site in sites:
        site_specs = generate_patrol_specs_for_site(site["id"])
        for spec in site_specs:
            spec["id"] = spec_id_counter
            patrol_specs.append(spec)
            spec_id_counter += 1

    # Generate checkpoints
    checkpoints = []
    checkpoint_id_counter = 1
    spec_checkpoints = {}  # Map spec_id to list of checkpoint ids

    for spec in patrol_specs:
        site = next(s for s in sites if s["id"] == spec["site_id"])
        spec_cps = generate_checkpoints_for_spec(spec["id"], site["name"])
        spec_checkpoints[spec["id"]] = []

        for cp in spec_cps:
            cp["id"] = checkpoint_id_counter
            checkpoints.append(cp)
            spec_checkpoints[spec["id"]].append(checkpoint_id_counter)
            checkpoint_id_counter += 1

    # Generate patrol_checkpoints (linking table)
    patrol_checkpoint_links = []
    for spec in patrol_specs:
        cp_ids = spec_checkpoints[spec["id"]]
        for order, cp_id in enumerate(cp_ids, start=1):
            patrol_checkpoint_links.append({
                "patrol_spec_id": spec["id"],
                "checkpoint_id": cp_id,
                "display_order": order,
            })

    # Generate patrol reports for 6 months
    patrol_reports = []
    report_checkpoints = []
    report_id_counter = 1
    report_cp_id_counter = 1

    # 6 months ago from "today" (using a fixed date for reproducibility)
    end_date = datetime(2024, 10, 15)
    start_date = end_date - timedelta(days=180)

    current_date = start_date
    while current_date <= end_date:
        for spec in patrol_specs:
            # Parse earliest and latest times
            earliest_h, earliest_m = parse_time(spec["earliest_start"])
            latest_h, latest_m = parse_time(spec["latest_start"])

            # Generate random start time within window
            start_h, start_m = generate_time_in_range(earliest_h, earliest_m, latest_h, latest_m)

            # Determine if start is before or after midnight for date handling
            if start_h < 12:  # After midnight, use next day
                patrol_date = current_date + timedelta(days=1)
            else:
                patrol_date = current_date

            start_time = patrol_date.replace(hour=start_h, minute=start_m, second=0, microsecond=0)

            # Patrol duration: 30-90 mins based on checkpoint count
            num_cps = len(spec_checkpoints[spec["id"]])
            duration_mins = random.randint(max(30, num_cps), min(90, num_cps * 3))
            end_time = start_time + timedelta(minutes=duration_mins)

            officer = random.choice(OFFICERS)

            patrol_reports.append({
                "id": report_id_counter,
                "patrol_spec_id": spec["id"],
                "officer_name": officer,
                "start_time": start_time.strftime("%Y-%m-%d %H:%M"),
                "end_time": end_time.strftime("%Y-%m-%d %H:%M"),
            })

            # Generate checkpoint visits
            cp_ids = spec_checkpoints[spec["id"]].copy()

            # 10% of patrols have missing checkpoints
            if random.random() < 0.1:
                num_missing = random.randint(1, max(1, len(cp_ids) // 5))  # Up to 20%
                for _ in range(num_missing):
                    if len(cp_ids) > 5:  # Keep at least 5
                        cp_ids.remove(random.choice(cp_ids))

            # Spread timestamps chronologically
            time_per_cp = duration_mins / len(cp_ids) if cp_ids else 0

            # Determine if this report has deviations (10% chance)
            has_deviations = random.random() < 0.1
            deviation_cp_ids = []
            if has_deviations:
                num_deviations = random.randint(1, max(1, len(cp_ids) // 10))
                deviation_cp_ids = random.sample(cp_ids, min(num_deviations, len(cp_ids)))

            for idx, cp_id in enumerate(cp_ids):
                # Calculate timestamp
                cp_time = start_time + timedelta(minutes=time_per_cp * idx + random.uniform(0, time_per_cp * 0.5))

                has_deviation = cp_id in deviation_cp_ids
                action = None
                comment = None

                if has_deviation:
                    action = random.choice(DEVIATION_ACTIONS)

                    # 25% of deviations are serious with detailed comments
                    if random.random() < 0.25:
                        cp_info = next(c for c in checkpoints if c["id"] == cp_id)
                        comment = generate_serious_comment(cp_info["name"], cp_time)

                report_checkpoints.append({
                    "id": report_cp_id_counter,
                    "patrol_report_id": report_id_counter,
                    "checkpoint_id": cp_id,
                    "timestamp": cp_time.strftime("%Y-%m-%d %H:%M"),
                    "has_deviation": has_deviation,
                    "action_taken": action,
                    "comment": comment,
                })
                report_cp_id_counter += 1

            report_id_counter += 1

        current_date += timedelta(days=1)

    return {
        "tables": {
            "sites": {
                "columns": ["id", "name", "customer", "address", "lon", "lat"],
                "rows": [[s["id"], s["name"], s["customer"], s["address"], s["lon"], s["lat"]] for s in sites]
            },
            "patrol_specifications": {
                "columns": ["id", "site_id", "description", "earliest_start", "latest_start"],
                "rows": [[ps["id"], ps["site_id"], ps["description"], ps["earliest_start"], ps["latest_start"]] for ps in patrol_specs]
            },
            "checkpoints": {
                "columns": ["id", "patrol_specification_id", "name", "description"],
                "rows": [[c["id"], c["spec_id"], c["name"], c["description"]] for c in checkpoints]
            },
            "patrol_checkpoints": {
                "columns": ["patrol_specification_id", "checkpoint_id", "display_order"],
                "rows": [[pc["patrol_spec_id"], pc["checkpoint_id"], pc["display_order"]] for pc in patrol_checkpoint_links]
            },
            "patrol_reports": {
                "columns": ["id", "patrol_specification_id", "officer_name", "start_time", "end_time"],
                "rows": [[pr["id"], pr["patrol_spec_id"], pr["officer_name"], pr["start_time"], pr["end_time"]] for pr in patrol_reports]
            },
            "patrol_report_checkpoints": {
                "columns": ["id", "patrol_report_id", "checkpoint_id", "timestamp", "has_deviation", "action_taken", "comment"],
                "rows": [[rc["id"], rc["patrol_report_id"], rc["checkpoint_id"], rc["timestamp"], rc["has_deviation"], rc["action_taken"], rc["comment"]] for rc in report_checkpoints]
            }
        }
    }
