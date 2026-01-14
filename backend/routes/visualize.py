from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.llm import generate_visualization, generate_visualization_script

router = APIRouter()


class VisualizeRequest(BaseModel):
    columns: list[str]
    sampleData: list
    userHint: str | None = None


class VisualizeResponse(BaseModel):
    plotlyCode: str


class ScriptResponse(BaseModel):
    script: str


@router.post("/visualize", response_model=VisualizeResponse)
async def create_visualization(request: VisualizeRequest):
    """Generate Plotly visualization code from query results."""
    try:
        plotly_code = await generate_visualization(
            request.columns,
            request.sampleData,
            request.userHint
        )
        return VisualizeResponse(plotlyCode=plotly_code)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/visualize-script", response_model=ScriptResponse)
async def create_visualization_script(request: VisualizeRequest):
    """Generate JavaScript code to create Plotly visualization from query results."""
    try:
        script = await generate_visualization_script(
            request.columns,
            request.sampleData,
            request.userHint
        )
        return ScriptResponse(script=script)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
