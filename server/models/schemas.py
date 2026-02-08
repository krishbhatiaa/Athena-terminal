from pydantic import BaseModel, EmailStr
from typing import List, Optional

# Auth Schemas
class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str]
    address: Optional[str]
    phone: Optional[str]
    photo_url: Optional[str]
    is_active: bool
    
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    photo_url: Optional[str] = None

# Existing Schemas
class OptionRequest(BaseModel):
    S: float
    K: float
    T: float
    r: float
    sigma: float

class OptionResponse(BaseModel):
    price: float

class GreeksRequest(BaseModel):
    S: float
    K: float
    T: float
    r: float
    sigma: float

class GreeksResponse(BaseModel):
    delta: float
    gamma: float
    vega: float
    theta: float
    rho: float

class MonteCarloRequest(BaseModel):
    S: float
    T: float
    r: float
    sigma: float
    n: int = 10000

class MonteCarloResponse(BaseModel):
    mean: float
    std: float
    sample: List[float]

class RiskRequest(BaseModel):
    returns: List[float]
    confidence: float = 0.95

class RiskResponse(BaseModel):
    var: float
    expected_shortfall: float

class Position(BaseModel):
    symbol: str
    qty: float
    avg_price: Optional[float] = None

class PortfolioCreateRequest(BaseModel):
    user_id: str
    positions: List[Position]

class PortfolioResponse(BaseModel):
    user_id: str
    positions: List[Position]

class StockPriceRequest(BaseModel):
    symbol: str

