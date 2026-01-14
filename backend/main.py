from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routes import data, query, visualize

load_dotenv()

app = FastAPI(title="Chat Your Data API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(data.router, prefix="/api")
app.include_router(query.router, prefix="/api")
app.include_router(visualize.router, prefix="/api")


@app.get("/health")
async def health_check():
    return {"status": "ok"}
