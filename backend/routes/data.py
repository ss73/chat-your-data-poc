from fastapi import APIRouter, Query
from services.sample_data import generate_sample_data, get_datasets

router = APIRouter()


@router.get("/datasets")
async def list_datasets():
    """Return available datasets."""
    return get_datasets()


@router.get("/data")
async def get_business_data(dataset: str = Query(default="sales")):
    """Return business data to populate the frontend SQLite database."""
    return generate_sample_data(dataset)
