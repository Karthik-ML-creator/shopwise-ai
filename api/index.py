from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.wsgi import WSGIMiddleware
import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.config import settings
from backend.app.database import engine
from backend.app.models import Base
from backend.app.routers import auth, products, behavior, recommendations

# Create FastAPI application instance
app = FastAPI(
    title="Aurora E-Commerce Recommendations API",
    description="A high-performance product recommendation API driving personalized retail suggestions using Hybrid SVD models.",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# Configure CORS Middleware
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "https://*.vercel.app",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Endpoint Routers
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(behavior.router)
app.include_router(recommendations.router)

# Database table setup on API startup
@app.on_event("startup")
def on_startup():
    print("[INIT] Initializing database mappings...")
    Base.metadata.create_all(bind=engine)
    print("[INIT] Database initialized successfully.")

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "aurora-backend"}

@app.get("/")
def root():
    return {"message": "Aurora Backend API - See /api/docs for API documentation"}
