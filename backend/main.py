import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import CORS_ORIGINS
from backend.routes import (
    dashboard,
    vessels,
    anomalies,
    analytics,
    model_comparison,
    data_quality,
    health,
)

app = FastAPI(
    title="VESSEL-X AIS Anomaly Intelligence API",
    description="Production REST API exposing AIS Vessel Feature Engineering, Mathematical Scoring, and Isolation Forest Detection.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(dashboard.router)
app.include_router(vessels.router)
app.include_router(anomalies.router)
app.include_router(analytics.router)
app.include_router(model_comparison.router)
app.include_router(data_quality.router)
app.include_router(health.router)

@app.get("/", tags=["Root"])
def read_root():
    return {
        "platform": "VESSEL-X AIS Anomaly Intelligence Platform",
        "status": "operational",
        "docs": "/docs",
        "summary": "/api/dashboard/summary",
    }

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
