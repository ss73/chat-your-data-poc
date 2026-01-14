import random
from datetime import datetime, timedelta

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

FIRST_NAMES = ["Alice", "Bob", "Carol", "David", "Emma", "Frank", "Grace", "Henry",
               "Ivy", "Jack", "Kate", "Leo", "Mia", "Noah", "Olivia", "Paul",
               "Quinn", "Rose", "Sam", "Tina", "Uma", "Victor", "Wendy", "Xavier", "Yara", "Zach"]
LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
              "Davis", "Rodriguez", "Martinez", "Wilson", "Anderson", "Taylor", "Thomas"]


def generate_sample_data():
    random.seed(42)

    products = []
    for i, (name, category, price) in enumerate(PRODUCTS, start=1):
        products.append({
            "id": i,
            "name": name,
            "category": category,
            "price": price
        })

    customers = []
    used_names = set()
    for i in range(1, 51):
        while True:
            name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
            if name not in used_names:
                used_names.add(name)
                break
        customers.append({
            "id": i,
            "name": name,
            "region": random.choice(REGIONS),
            "segment": random.choice(SEGMENTS)
        })

    sales = []
    start_date = datetime(2024, 1, 1)
    for i in range(1, 501):
        product = random.choice(products)
        customer = random.choice(customers)
        days_offset = random.randint(0, 364)
        sale_date = start_date + timedelta(days=days_offset)
        quantity = random.randint(1, 10)
        amount = round(product["price"] * quantity, 2)

        sales.append({
            "id": i,
            "date": sale_date.strftime("%Y-%m-%d"),
            "product_id": product["id"],
            "customer_id": customer["id"],
            "quantity": quantity,
            "amount": amount
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


def get_schema_sql():
    return """
CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL
);

CREATE TABLE customers (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    region TEXT NOT NULL,
    segment TEXT NOT NULL
);

CREATE TABLE sales (
    id INTEGER PRIMARY KEY,
    date TEXT NOT NULL,
    product_id INTEGER NOT NULL,
    customer_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    amount REAL NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);
""".strip()
