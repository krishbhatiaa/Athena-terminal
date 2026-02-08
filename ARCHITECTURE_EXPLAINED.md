# Architecture Deep Dive

## 🎯 System Overview

ATHENA Terminal is a full-stack financial application that provides:
- Real-time stock market data
- Quantitative finance algorithms
- Portfolio management
- Interactive charts and analytics

---

## 📦 Component Breakdown

### 1. Frontend (React + Vite)

**Location**: `frontend/`

**Key Files**:
- `src/main.jsx` - Application entry point
- `src/App.jsx` - Main router
- `src/components/` - React components
- `src/utils/indicators.js` - Technical indicator calculations

**How It Works**:
```
User Interaction
    ↓
React Component
    ↓
Axios HTTP Request
    ↓
FastAPI Backend
    ↓
Response (JSON)
    ↓
Update UI
```

**Key Components**:
- **Dashboard**: Displays market overview with live prices
- **AssetDetail**: Shows detailed analysis of a single stock
- **CandlestickChart**: Renders OHLCV charts using Plotly
- **Portfolio**: Manages user holdings and P&L

**State Management**:
- React hooks (useState, useEffect)
- Context API for global state (if needed)
- Local state for component-specific data

**Real-time Updates**:
- Server-Sent Events (SSE) for live price streaming
- WebSocket alternative (can be implemented)

---

### 2. Backend (FastAPI)

**Location**: `server/`

#### 2.1 Main Application (`server/main.py`)

**Purpose**: Application entry point, route registration, middleware setup

**Key Responsibilities**:
- Initialize FastAPI app
- Configure CORS middleware
- Register all routers
- Mount static files (if needed)
- Define health check endpoint

**Flow**:
```
HTTP Request
    ↓
CORS Middleware
    ↓
Route Matching
    ↓
Router Handler
    ↓
Service Layer
    ↓
Response
```

#### 2.2 Routers (`server/routers/`)

**Purpose**: Define API endpoints and request/response handling

**Structure**:
```
routers/
├── auth.py          # Authentication endpoints
├── market.py        # Market data endpoints
├── algorithms.py    # Quantitative algorithms
└── portfolio.py     # Portfolio management
```

**Example Flow (Market Data)**:
```python
# Request: GET /market/price/AAPL
@router.get("/price/{symbol}")
async def get_stock_price(symbol: str):
    # 1. Validate input
    symbol = symbol.upper()
    
    # 2. Call service layer
    price = market_data.fetch_stock_price(symbol)
    
    # 3. Handle errors
    if price is None:
        return {"error": "Could not fetch price"}
    
    # 4. Return response
    return {"symbol": symbol, "price": price}
```

#### 2.3 Services (`server/services/`)

**Purpose**: Business logic and external API integration

**Key Services**:

**market_data.py**:
- Integrates with yfinance library
- Fetches real-time and historical data
- Handles API errors gracefully

**algorithms.py**:
- Wraps quantitative finance modules
- Provides clean interface to complex calculations
- Handles edge cases (division by zero, etc.)

**portfolio.py**:
- Portfolio calculations (P&L, allocation)
- Position management
- Analytics generation

#### 2.4 Models (`server/models/`)

**database.py**:
- SQLAlchemy ORM models
- Database connection management
- Table definitions

**schemas.py**:
- Pydantic models for request/response validation
- Type safety
- Automatic API documentation

**Database Models**:
```python
User
  ├── id
  ├── username
  ├── email
  └── password_hash

Portfolio
  ├── id
  ├── user_id (FK)
  └── created_at

Position
  ├── id
  ├── portfolio_id (FK)
  ├── symbol
  ├── qty
  └── avg_price
```

---

### 3. Quantitative Finance Module (`quant/`)

**Purpose**: Core financial calculations

**Modules**:

**blackscholes.py**:
- Black-Scholes option pricing model
- Mathematical formula implementation
- Uses SciPy for normal distribution

**greeks.py**:
- Delta, Gamma, Vega, Theta, Rho calculations
- Partial derivatives of option price
- Risk sensitivity measures

**montecarlo.py**:
- Monte Carlo simulation for price paths
- Random walk generation
- Statistical analysis

**risk.py**:
- Value at Risk (VaR) calculation
- Expected Shortfall (CVaR)
- Risk metrics

**How It Works**:
```
Input Parameters (S, K, T, r, sigma)
    ↓
Mathematical Model
    ↓
NumPy/SciPy Calculations
    ↓
Result (price, greeks, etc.)
```

---

### 4. Database Layer

**Current**: SQLite (development)
**Production**: PostgreSQL recommended

**ORM**: SQLAlchemy

**Connection Management**:
```python
# Create session
db = SessionLocal()

# Use session
user = db.query(User).filter(User.id == 1).first()

# Commit changes
db.commit()

# Close session
db.close()
```

**Database Operations**:
- Create: `db.add(model)`
- Read: `db.query(Model).filter(...).first()`
- Update: Modify model, then `db.commit()`
- Delete: `db.delete(model)`

---

## 🔄 Request Flow Examples

### Example 1: Get Stock Price

```
1. User clicks on stock symbol
   ↓
2. Frontend: Dashboard.jsx
   - useEffect triggers API call
   - axios.get('/market/price/AAPL')
   ↓
3. Backend: server/routers/market.py
   - Route handler receives request
   - Extracts symbol parameter
   ↓
4. Service: server/services/market_data.py
   - fetch_stock_price('AAPL')
   - Creates yfinance.Ticker object
   - Fetches latest price
   ↓
5. yfinance API
   - Returns current price data
   ↓
6. Response flows back:
   Service → Router → Frontend → UI Update
```

### Example 2: Calculate Option Price

```
1. User fills form with option parameters
   ↓
2. Frontend: AssetDetail.jsx
   - POST /algorithms/black_scholes
   - Body: {S: 100, K: 105, T: 0.25, r: 0.05, sigma: 0.2}
   ↓
3. Backend: server/routers/algorithms.py
   - Validates request body (Pydantic schema)
   - Extracts parameters
   ↓
4. Service: server/services/algorithms.py
   - black_scholes_price(S, K, T, r, sigma)
   ↓
5. Quant Module: quant/blackscholes.py
   - call_price() function
   - Mathematical calculations
   - Uses SciPy norm.cdf()
   ↓
6. Response: {"price": 2.45}
   ↓
7. Frontend displays result
```

### Example 3: Real-time Price Stream

```
1. User opens dashboard
   ↓
2. Frontend: Dashboard.jsx
   - Opens SSE connection
   - EventSource('/market/stream?symbols=AAPL,MSFT')
   ↓
3. Backend: server/routers/market.py
   - stream_prices() async generator
   - Infinite loop
   ↓
4. Every 2 seconds:
   - Fetch prices for all symbols
   - Format as JSON
   - Yield SSE event
   ↓
5. Frontend receives event
   - Updates UI with new prices
   - Re-renders components
```

---

## 🔐 Authentication Flow

### Registration
```
1. User submits registration form
   ↓
2. POST /auth/register
   - Username, email, password
   ↓
3. Backend validates input
   - Check if user exists
   - Hash password (bcrypt)
   ↓
4. Create user in database
   ↓
5. Generate JWT token
   - Payload: {sub: username, exp: timestamp}
   - Sign with SECRET_KEY
   ↓
6. Return token to frontend
   ↓
7. Frontend stores token (localStorage)
```

### Protected Route Access
```
1. User makes authenticated request
   - Include token in header: Authorization: Bearer <token>
   ↓
2. Backend: get_user_from_token()
   - Extract token from header
   - Decode JWT
   - Verify signature
   - Check expiration
   ↓
3. Query database for user
   ↓
4. Return user object
   ↓
5. Process request with user context
```

---

## 📊 Data Flow: Portfolio Analytics

```
1. GET /portfolio/analytics?token=xxx
   ↓
2. Extract user from token
   ↓
3. Query database for user's portfolio
   ↓
4. For each position:
   - Get current price (yfinance)
   - Calculate cost: qty * avg_price
   - Calculate value: qty * current_price
   - Calculate P&L: value - cost
   - Calculate P&L %: (P&L / cost) * 100
   ↓
5. Calculate totals:
   - Total cost: sum of all costs
   - Total value: sum of all values
   - Total P&L: total_value - total_cost
   ↓
6. Calculate allocation:
   - For each position: (value / total_value) * 100
   ↓
7. Return JSON response with all analytics
```

---

## 🎨 Frontend Architecture

### Component Hierarchy
```
App
├── Layout
│   ├── Sidebar (Navigation)
│   └── Main Content Area
│       ├── Dashboard
│       │   ├── MarketCard (multiple)
│       │   └── Sparkline
│       ├── AssetDetail
│       │   ├── CandlestickChart
│       │   └── Indicators Panel
│       ├── Portfolio
│       │   └── Holdings Table
│       └── UserProfile
└── Auth
    ├── Login
    └── Register
```

### State Management
- **Local State**: Component-specific data (useState)
- **Props**: Parent-to-child data flow
- **Context**: Global state (if implemented)
- **URL State**: Route parameters, query strings

### Data Fetching
- **Axios**: HTTP client for API calls
- **useEffect**: Trigger API calls on component mount
- **Loading States**: Show spinners during API calls
- **Error Handling**: Display error messages

---

## 🔧 Configuration Management

### Environment Variables
```python
# server/routers/auth.py
SECRET_KEY = os.getenv("SECRET_KEY", "default-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24 * 60
```

### Database Configuration
```python
# server/models/database.py
DATABASE_URL = "sqlite:///./athenaa.db"
# Or: os.getenv("DATABASE_URL")
```

### CORS Configuration
```python
# server/main.py
allow_origins = ["*"]  # Development
# Production: ["https://yourdomain.com"]
```

---

## 🚀 Deployment Architecture

### Docker Multi-Stage Build
```
Stage 1: Frontend Builder
  - Node.js 18
  - Install dependencies
  - Build React app
  - Output: /frontend/dist

Stage 2: Backend Runtime
  - Python 3.12-slim
  - Install Python dependencies
  - Copy application code
  - Copy frontend dist
  - Expose port 8000
```

### Container Structure
```
Container
├── Python Runtime
├── Application Code
│   ├── server/
│   ├── quant/
│   └── frontend/dist/
├── Dependencies
│   └── requirements.txt packages
└── Database (SQLite file)
```

---

## 📈 Performance Considerations

### Backend
- **Async/Await**: Non-blocking I/O operations
- **Connection Pooling**: Database connections
- **Caching**: Market data (optional)
- **Compression**: Gzip middleware

### Frontend
- **Code Splitting**: Lazy load routes
- **Memoization**: React.memo for expensive components
- **Virtualization**: For large lists
- **Image Optimization**: Compress assets

### Database
- **Indexes**: On frequently queried columns
- **Query Optimization**: Avoid N+1 queries
- **Connection Pooling**: Reuse connections

---

## 🔒 Security Measures

1. **Password Hashing**: bcrypt with salt
2. **JWT Tokens**: Signed with secret key
3. **CORS**: Restrict origins in production
4. **Input Validation**: Pydantic schemas
5. **SQL Injection**: ORM prevents SQL injection
6. **HTTPS**: Enforce in production
7. **Rate Limiting**: (To be implemented)

---

## 🧪 Testing Strategy

### Unit Tests
- Test individual functions
- Mock external dependencies
- Test edge cases

### Integration Tests
- Test API endpoints
- Test database operations
- Test service layer

### End-to-End Tests
- Test user workflows
- Test frontend-backend integration

---

## 📝 Key Design Decisions

1. **FastAPI**: Chosen for async support, automatic docs, type safety
2. **SQLite**: Simple for development, easy to migrate to PostgreSQL
3. **yfinance**: Free stock data, no API key required
4. **React**: Component-based, large ecosystem
5. **Plotly**: Professional charts, interactive
6. **Docker**: Consistent deployment, isolation

---

## 🔮 Future Enhancements

1. **WebSocket**: Replace SSE for bidirectional communication
2. **PostgreSQL**: Production database
3. **Redis**: Caching layer
4. **Celery**: Background tasks
5. **Kubernetes**: Container orchestration
6. **Monitoring**: Application Insights, Prometheus
7. **CI/CD**: Automated testing and deployment

---

**This architecture provides a solid foundation for a production-ready financial terminal application.**
