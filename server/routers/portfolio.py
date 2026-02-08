from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from server.models.schemas import (
    PortfolioCreateRequest, PortfolioResponse, Position as PositionSchema
)
from server.models import database
from server.models.database import User
from server.routers.auth import get_user_from_token
from server.services import market_data
import numpy as np

router = APIRouter()

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/create", response_model=PortfolioResponse)
async def create_portfolio(
    req: PortfolioCreateRequest,
    token: str,
    db: Session = Depends(get_db)
):
    """Create a new portfolio for the authenticated user"""
    user = get_user_from_token(token, db)
    
    # Check if portfolio exists
    existing = db.query(database.Portfolio).filter(database.Portfolio.user_id == user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Portfolio already exists")
    
    portfolio = database.Portfolio(user_id=user.id)
    db.add(portfolio)
    db.commit()
    db.refresh(portfolio)
    
    # Add positions
    for pos in req.positions:
        position = database.Position(
            portfolio_id=portfolio.id,
            symbol=pos.symbol,
            qty=pos.qty,
            avg_price=pos.avg_price
        )
        db.add(position)
    db.commit()
    
    return await get_user_portfolio(token, db)


@router.get("", response_model=PortfolioResponse)
async def get_user_portfolio(token: str, db: Session = Depends(get_db)):
    """Get the authenticated user's portfolio"""
    user = get_user_from_token(token, db)
    
    portfolio = db.query(database.Portfolio).filter(database.Portfolio.user_id == user.id).first()
    if not portfolio:
        # Create empty portfolio if doesn't exist
        portfolio = database.Portfolio(user_id=user.id)
        db.add(portfolio)
        db.commit()
        db.refresh(portfolio)
    
    positions_db = db.query(database.Position).filter(database.Position.portfolio_id == portfolio.id).all()
    positions = [PositionSchema(symbol=p.symbol, qty=p.qty, avg_price=p.avg_price) for p in positions_db]
    
    return PortfolioResponse(user_id=str(user.id), positions=positions)


@router.put("", response_model=PortfolioResponse)
async def update_portfolio(
    req: PortfolioCreateRequest,
    token: str,
    db: Session = Depends(get_db)
):
    """Update the authenticated user's portfolio"""
    user = get_user_from_token(token, db)
    
    portfolio = db.query(database.Portfolio).filter(database.Portfolio.user_id == user.id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    # Delete old positions
    db.query(database.Position).filter(database.Position.portfolio_id == portfolio.id).delete()
    
    # Add new positions
    for pos in req.positions:
        position = database.Position(
            portfolio_id=portfolio.id,
            symbol=pos.symbol,
            qty=pos.qty,
            avg_price=pos.avg_price
        )
        db.add(position)
    db.commit()
    
    return await get_user_portfolio(token, db)


@router.get("/analytics")
async def portfolio_analytics(token: str, db: Session = Depends(get_db)):
    """Get portfolio analytics: total value, P&L, allocation."""
    user = get_user_from_token(token, db)
    
    portfolio = db.query(database.Portfolio).filter(database.Portfolio.user_id == user.id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    positions_db = db.query(database.Position).filter(database.Position.portfolio_id == portfolio.id).all()
    
    total_cost = 0.0
    holdings = {}
    allocation = {}
    
    for pos in positions_db:
        current_price = market_data.fetch_stock_price(pos.symbol)
        if current_price is None:
            continue
        
        cost = (pos.avg_price or 0) * pos.qty
        current_value = current_price * pos.qty
        total_cost += cost
        
        holdings[pos.symbol] = {
            "qty": pos.qty,
            "avg_price": pos.avg_price,
            "current_price": current_price,
            "cost": cost,
            "value": current_value,
            "gain_loss": current_value - cost,
            "gain_loss_pct": ((current_value - cost) / cost * 100) if cost > 0 else 0
        }
    
    total_value = sum(h["value"] for h in holdings.values())
    for symbol, h in holdings.items():
        allocation[symbol] = (h["value"] / total_value * 100) if total_value > 0 else 0
    
    return {
        "user_id": str(user.id),
        "total_cost": total_cost,
        "total_value": total_value,
        "total_gain_loss": total_value - total_cost,
        "total_gain_loss_pct": ((total_value - total_cost) / total_cost * 100) if total_cost > 0 else 0,
        "holdings": holdings,
        "allocation": allocation
    }
