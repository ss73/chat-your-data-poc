from fastapi import APIRouter
from services.sample_data import generate_sample_data

router = APIRouter()


@router.get("/data")
async def get_business_data():
    """Return business data to populate the frontend SQLite database."""
    return generate_sample_data()
