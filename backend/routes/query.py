from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.llm import generate_sql

router = APIRouter()


class QueryRequest(BaseModel):
    question: str
    schema: str


class QueryResponse(BaseModel):
    sql: str


@router.post("/query", response_model=QueryResponse)
async def convert_to_sql(request: QueryRequest):
    """Convert natural language question to SQL query."""
    try:
        sql = await generate_sql(request.question, request.schema)
        return QueryResponse(sql=sql)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
