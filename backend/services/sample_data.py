import random
from datetime import datetime, timedelta

from .security_data import generate_security_data

# Shared name data
FIRST_NAMES = ["Alice", "Bob", "Carol", "David", "Emma", "Frank", "Grace", "Henry",
               "Ivy", "Jack", "Kate", "Leo", "Mia", "Noah", "Olivia", "Paul",
               "Quinn", "Rose", "Sam", "Tina", "Uma", "Victor", "Wendy", "Xavier", "Yara", "Zach"]
LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
              "Davis", "Rodriguez", "Martinez", "Wilson", "Anderson", "Taylor", "Thomas"]

DATASETS = {
    "sales": {
        "name": "Sales",
        "description": "Products, customers, and sales transactions"
    },
    "hr": {
        "name": "HR / Employees",
        "description": "Employees, departments, and performance data"
    },
    "inventory": {
        "name": "Inventory",
        "description": "Products, warehouses, and stock levels"
    },
    "support": {
        "name": "Support Tickets",
        "description": "Tickets, customers, and agents"
    },
    "security": {
        "name": "Security Patrolling",
        "description": "Sites, patrol specifications, checkpoints, and patrol reports"
    }
}

# ============== SALES DATASET ==============

PRODUCTS = [
    ("Laptop Pro", "Electronics", 1299.99),
    ("Wireless Mouse", "Electronics", 49.99),
    ("Mechanical Keyboard", "Electronics", 149.99),
    ("USB-C Hub", "Electronics", 79.99),
    ("Monitor 27\"", "Electronics", 399.99),
    ("Office Chair", "Furniture", 299.99),
    ("Standing Desk", "Furniture", 599.99),
    ("Desk Lamp", "Furniture", 45.99),
    ("Filing Cabinet", "Furniture", 189.99),
    ("Bookshelf", "Furniture", 129.99),
    ("Notebook Pack", "Office Supplies", 12.99),
    ("Pen Set", "Office Supplies", 8.99),
    ("Stapler", "Office Supplies", 15.99),
    ("Paper Ream", "Office Supplies", 24.99),
    ("Binder Set", "Office Supplies", 19.99),
    ("Webcam HD", "Electronics", 89.99),
    ("Headphones", "Electronics", 199.99),
    ("Desk Organizer", "Office Supplies", 34.99),
    ("Whiteboard", "Furniture", 79.99),
    ("Ergonomic Footrest", "Furniture", 59.99),
]

REGIONS = ["North", "South", "East", "West"]
SEGMENTS = ["Enterprise", "SMB", "Consumer", "Government"]


def generate_sales_data():
    random.seed(42)

    products = []
    for i, (name, category, price) in enumerate(PRODUCTS, start=1):
        products.append({"id": i, "name": name, "category": category, "price": price})

    customers = []
    used_names = set()
    for i in range(1, 51):
        while True:
            name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
            if name not in used_names:
                used_names.add(name)
                break
        customers.append({
            "id": i, "name": name,
            "region": random.choice(REGIONS),
            "segment": random.choice(SEGMENTS)
        })

    sales = []
    end_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    start_date = end_date - timedelta(days=365)
    for i in range(1, 501):
        product = random.choice(products)
        customer = random.choice(customers)
        days_offset = random.randint(0, 364)
        sale_date = start_date + timedelta(days=days_offset)
        quantity = random.randint(1, 10)
        amount = round(product["price"] * quantity, 2)
        sales.append({
            "id": i, "date": sale_date.strftime("%Y-%m-%d"),
            "product_id": product["id"], "customer_id": customer["id"],
            "quantity": quantity, "amount": amount
        })

    return {
        "tables": {
            "products": {
                "columns": ["id", "name", "category", "price"],
                "rows": [[p["id"], p["name"], p["category"], p["price"]] for p in products]
            },
            "customers": {
                "columns": ["id", "name", "region", "segment"],
                "rows": [[c["id"], c["name"], c["region"], c["segment"]] for c in customers]
            },
            "sales": {
                "columns": ["id", "date", "product_id", "customer_id", "quantity", "amount"],
                "rows": [[s["id"], s["date"], s["product_id"], s["customer_id"], s["quantity"], s["amount"]] for s in sales]
            }
        }
    }


# ============== HR DATASET ==============

DEPARTMENTS = [
    ("Engineering", "San Francisco"),
    ("Product", "San Francisco"),
    ("Sales", "New York"),
    ("Marketing", "New York"),
    ("HR", "Chicago"),
    ("Finance", "Chicago"),
    ("Operations", "Austin"),
    ("Customer Success", "Austin"),
]

JOB_TITLES = {
    "Engineering": ["Software Engineer", "Senior Engineer", "Staff Engineer", "Engineering Manager", "Tech Lead"],
    "Product": ["Product Manager", "Senior PM", "Product Designer", "UX Researcher"],
    "Sales": ["Account Executive", "Sales Rep", "Sales Manager", "Sales Director"],
    "Marketing": ["Marketing Manager", "Content Writer", "SEO Specialist", "Brand Manager"],
    "HR": ["HR Specialist", "Recruiter", "HR Manager", "Benefits Coordinator"],
    "Finance": ["Accountant", "Financial Analyst", "Controller", "Finance Manager"],
    "Operations": ["Operations Manager", "Project Manager", "Business Analyst", "Coordinator"],
    "Customer Success": ["CS Manager", "Support Specialist", "Account Manager", "CS Director"],
}

PERFORMANCE_RATINGS = ["Exceeds Expectations", "Meets Expectations", "Needs Improvement", "Outstanding"]


def generate_hr_data():
    random.seed(43)

    departments = []
    for i, (name, location) in enumerate(DEPARTMENTS, start=1):
        departments.append({"id": i, "name": name, "location": location})

    employees = []
    used_names = set()
    for i in range(1, 101):
        while True:
            name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
            if name not in used_names:
                used_names.add(name)
                break
        dept = random.choice(departments)
        hire_date = datetime.now() - timedelta(days=random.randint(0, 2500))
        salary = random.randint(50, 200) * 1000
        employees.append({
            "id": i, "name": name,
            "department_id": dept["id"],
            "title": random.choice(JOB_TITLES[dept["name"]]),
            "hire_date": hire_date.strftime("%Y-%m-%d"),
            "salary": salary
        })

    reviews = []
    for i, emp in enumerate(employees, start=1):
        for year in [2022, 2023, 2024]:
            reviews.append({
                "id": len(reviews) + 1,
                "employee_id": emp["id"],
                "year": year,
                "rating": random.choice(PERFORMANCE_RATINGS),
                "score": round(random.uniform(2.5, 5.0), 1)
            })

    return {
        "tables": {
            "departments": {
                "columns": ["id", "name", "location"],
                "rows": [[d["id"], d["name"], d["location"]] for d in departments]
            },
            "employees": {
                "columns": ["id", "name", "department_id", "title", "hire_date", "salary"],
                "rows": [[e["id"], e["name"], e["department_id"], e["title"], e["hire_date"], e["salary"]] for e in employees]
            },
            "performance_reviews": {
                "columns": ["id", "employee_id", "year", "rating", "score"],
                "rows": [[r["id"], r["employee_id"], r["year"], r["rating"], r["score"]] for r in reviews]
            }
        }
    }


# ============== INVENTORY DATASET ==============

WAREHOUSES = [
    ("West Coast DC", "Los Angeles", 50000),
    ("East Coast DC", "Newark", 45000),
    ("Central DC", "Dallas", 40000),
    ("Southeast DC", "Atlanta", 35000),
]

SUPPLIERS = [
    ("TechSource Inc", "Electronics", "China"),
    ("FurniturePlus", "Furniture", "USA"),
    ("OfficeMax Supply", "Office Supplies", "USA"),
    ("Global Imports", "Electronics", "Taiwan"),
    ("Quality Furnishings", "Furniture", "Mexico"),
]

INVENTORY_PRODUCTS = [
    ("Widget A", "Electronics", 29.99, "TechSource Inc"),
    ("Widget B", "Electronics", 49.99, "Global Imports"),
    ("Gadget X", "Electronics", 99.99, "TechSource Inc"),
    ("Gadget Y", "Electronics", 149.99, "Global Imports"),
    ("Chair Basic", "Furniture", 89.99, "FurniturePlus"),
    ("Chair Deluxe", "Furniture", 199.99, "Quality Furnishings"),
    ("Desk Standard", "Furniture", 249.99, "FurniturePlus"),
    ("Desk Executive", "Furniture", 499.99, "Quality Furnishings"),
    ("Paper A4", "Office Supplies", 9.99, "OfficeMax Supply"),
    ("Pens Box", "Office Supplies", 14.99, "OfficeMax Supply"),
    ("Stapler Pro", "Office Supplies", 24.99, "OfficeMax Supply"),
    ("Binders Pack", "Office Supplies", 19.99, "OfficeMax Supply"),
]


def generate_inventory_data():
    random.seed(44)

    warehouses = []
    for i, (name, city, capacity) in enumerate(WAREHOUSES, start=1):
        warehouses.append({"id": i, "name": name, "city": city, "capacity": capacity})

    suppliers = []
    for i, (name, category, country) in enumerate(SUPPLIERS, start=1):
        suppliers.append({"id": i, "name": name, "category": category, "country": country})

    products = []
    supplier_map = {s["name"]: s["id"] for s in suppliers}
    for i, (name, category, price, supplier_name) in enumerate(INVENTORY_PRODUCTS, start=1):
        products.append({
            "id": i, "name": name, "category": category,
            "unit_cost": price, "supplier_id": supplier_map[supplier_name]
        })

    stock_levels = []
    for product in products:
        for warehouse in warehouses:
            qty = random.randint(0, 500)
            reorder = random.randint(20, 100)
            stock_levels.append({
                "id": len(stock_levels) + 1,
                "product_id": product["id"],
                "warehouse_id": warehouse["id"],
                "quantity": qty,
                "reorder_level": reorder
            })

    return {
        "tables": {
            "warehouses": {
                "columns": ["id", "name", "city", "capacity"],
                "rows": [[w["id"], w["name"], w["city"], w["capacity"]] for w in warehouses]
            },
            "suppliers": {
                "columns": ["id", "name", "category", "country"],
                "rows": [[s["id"], s["name"], s["category"], s["country"]] for s in suppliers]
            },
            "products": {
                "columns": ["id", "name", "category", "unit_cost", "supplier_id"],
                "rows": [[p["id"], p["name"], p["category"], p["unit_cost"], p["supplier_id"]] for p in products]
            },
            "stock_levels": {
                "columns": ["id", "product_id", "warehouse_id", "quantity", "reorder_level"],
                "rows": [[s["id"], s["product_id"], s["warehouse_id"], s["quantity"], s["reorder_level"]] for s in stock_levels]
            }
        }
    }


# ============== SUPPORT TICKETS DATASET ==============

TICKET_CATEGORIES = ["Technical Issue", "Billing", "Feature Request", "Account Access", "Bug Report", "General Inquiry"]
PRIORITIES = ["Low", "Medium", "High", "Critical"]
STATUSES = ["open", "in_progress", "waiting_on_customer", "resolved", "closed"]


def generate_support_data():
    random.seed(45)

    # Customers
    customers = []
    used_names = set()
    plans = ["Free", "Basic", "Pro", "Enterprise"]
    for i in range(1, 76):
        while True:
            name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
            if name not in used_names:
                used_names.add(name)
                break
        customers.append({
            "id": i, "name": name,
            "email": f"{name.lower().replace(' ', '.')}@example.com",
            "plan": random.choice(plans)
        })

    # Agents
    agents = []
    agent_names = set()
    teams = ["Tier 1", "Tier 2", "Tier 3", "Billing"]
    for i in range(1, 13):
        while True:
            name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
            if name not in agent_names and name not in used_names:
                agent_names.add(name)
                break
        agents.append({
            "id": i, "name": name,
            "team": random.choice(teams)
        })

    # Tickets - ensure a realistic distribution of statuses
    # ~20% open, ~15% in_progress, ~10% waiting, ~30% resolved, ~25% closed
    tickets = []
    end_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    start_date = end_date - timedelta(days=300)
    status_weights = ["open"] * 20 + ["in_progress"] * 15 + ["waiting_on_customer"] * 10 + ["resolved"] * 30 + ["closed"] * 25

    for i in range(1, 301):
        customer = random.choice(customers)
        agent = random.choice(agents)
        created = start_date + timedelta(days=random.randint(0, 300), hours=random.randint(0, 23))
        status = random.choice(status_weights)
        resolved = None
        if status in ["resolved", "closed"]:
            resolved = created + timedelta(hours=random.randint(1, 72))
        tickets.append({
            "id": i,
            "customer_id": customer["id"],
            "agent_id": agent["id"],
            "category": random.choice(TICKET_CATEGORIES),
            "priority": random.choice(PRIORITIES),
            "status": status,
            "created_at": created.strftime("%Y-%m-%d %H:%M"),
            "resolved_at": resolved.strftime("%Y-%m-%d %H:%M") if resolved else None
        })

    return {
        "tables": {
            "customers": {
                "columns": ["id", "name", "email", "plan"],
                "rows": [[c["id"], c["name"], c["email"], c["plan"]] for c in customers]
            },
            "agents": {
                "columns": ["id", "name", "team"],
                "rows": [[a["id"], a["name"], a["team"]] for a in agents]
            },
            "tickets": {
                "columns": ["id", "customer_id", "agent_id", "category", "priority", "status", "created_at", "resolved_at"],
                "rows": [[t["id"], t["customer_id"], t["agent_id"], t["category"], t["priority"], t["status"], t["created_at"], t["resolved_at"]] for t in tickets]
            }
        }
    }


# ============== MAIN API ==============

def generate_sample_data(dataset: str = "sales"):
    generators = {
        "sales": generate_sales_data,
        "hr": generate_hr_data,
        "inventory": generate_inventory_data,
        "support": generate_support_data,
        "security": generate_security_data,
    }
    if dataset not in generators:
        raise ValueError(f"Unknown dataset: {dataset}")
    return generators[dataset]()


def get_datasets():
    return DATASETS
