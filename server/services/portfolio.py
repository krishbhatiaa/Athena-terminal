from server.models.schemas import PortfolioResponse, Position
from typing import List, Dict

# simple in-memory store for now
_store: Dict[str, List[Position]] = {}

def create_portfolio(user_id: str, positions: List[Position]) -> PortfolioResponse:
    _store[user_id] = positions
    return PortfolioResponse(user_id=user_id, positions=positions)

def get_portfolio(user_id: str) -> PortfolioResponse:
    p = _store.get(user_id)
    if not p:
        return None
    return PortfolioResponse(user_id=user_id, positions=p)

def update_portfolio(user_id: str, positions: List[Position]) -> PortfolioResponse:
    if user_id not in _store:
        return None
    _store[user_id] = positions
    return PortfolioResponse(user_id=user_id, positions=positions)
