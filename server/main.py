from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from server.routers import algorithms, portfolio, market, auth
import os

app = FastAPI(
    title="Athenaa MiniBloomberg API",
    description="Stock trading algorithms, portfolio management, and market data",
    version="1.0.0"
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(algorithms.router, prefix="/algorithms", tags=["algorithms"])
app.include_router(portfolio.router, prefix="/portfolio", tags=["portfolio"])
app.include_router(market.router, prefix="/market", tags=["market"])

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "version": "1.0.0"}

@app.get("/api/health")
async def health_check_api():
    """Health check endpoint (API version)."""
    return {"status": "ok", "version": "1.0.0"}

# Mount frontend static files (commented out to avoid interfering with API routes)
# Uncomment and adjust if you need to serve frontend files
# frontend_dist = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
# if os.path.exists(frontend_dist):
#     app.mount("/static", StaticFiles(directory=frontend_dist), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server.main:app", host="127.0.0.1", port=8000, reload=True)
