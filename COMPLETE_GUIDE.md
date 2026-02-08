# ATHENA Terminal - Complete Guide

## 📚 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [What Was Fixed](#what-was-fixed)
3. [How Everything Works](#how-everything-works)
4. [Cloud Deployment Requirements](#cloud-deployment-requirements)
5. [Step-by-Step Cloud Deployment](#step-by-step-cloud-deployment)
6. [Environment Configuration](#environment-configuration)
7. [API Documentation](#api-documentation)
8. [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                          │
│  React 18 + Vite Frontend (Port 5173 in dev, served in prod) │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/SSE
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              FASTAPI BACKEND (Port 8000)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Routes:                                           │  │
│  │  • /market/*     - Market data endpoints              │  │
│  │  • /algorithms/* - Quantitative finance algorithms    │  │
│  │  • /portfolio/*  - Portfolio management               │  │
│  │  • /auth/*       - User authentication                │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Services Layer:                                       │  │
│  │  • market_data.py  - yfinance integration            │  │
│  │  • algorithms.py   - Black-Scholes, Monte Carlo     │  │
│  │  • portfolio.py    - Portfolio calculations         │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Database Layer:                                       │  │
│  │  • SQLAlchemy ORM                                     │  │
│  │  • SQLite (dev) / PostgreSQL (prod)                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              EXTERNAL SERVICES                                │
│  • yfinance API - Stock market data                         │
│  • (Future) Real-time data feeds                             │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + Vite | User interface, real-time charts |
| **Backend** | FastAPI (Python 3.12) | REST API, business logic |
| **Database** | SQLite (dev) / PostgreSQL (prod) | User data, portfolios |
| **Market Data** | yfinance | Stock prices, historical data |
| **Charts** | Plotly.js | Candlestick charts, indicators |
| **Quantitative** | NumPy, SciPy | Financial calculations |
| **Container** | Docker | Deployment, isolation |

---

## 🔧 What Was Fixed

### 1. Authentication Function Mismatch
**Problem**: `get_current_user()` was defined as a FastAPI dependency expecting an Authorization header, but was being called directly with a token string in portfolio and auth endpoints.

**Solution**: Created a helper function `get_user_from_token()` that accepts a token string directly, while keeping `get_current_user()` as a dependency for proper FastAPI integration.

**Files Changed**:
- `server/routers/auth.py` - Added `get_user_from_token()` helper
- `server/routers/portfolio.py` - Updated to use `get_user_from_token()`

### 2. Route Registration
**Problem**: Health endpoint was returning 404 despite being registered.

**Solution**: Reorganized route registration order and removed conflicting static file mounts.

**Files Changed**:
- `server/main.py` - Fixed route order, added HTTPException import

### 3. Import Errors
**Problem**: Missing imports and incorrect function signatures.

**Solution**: Fixed all import statements and function calls across routers.

---

## 🔍 How Everything Works

### Backend Architecture

#### 1. **Main Application** (`server/main.py`)
```python
# FastAPI app initialization
app = FastAPI(title="Athenaa MiniBloomberg API")

# CORS middleware for frontend communication
app.add_middleware(CORSMiddleware, allow_origins=["*"])

# Register routers
app.include_router(auth.router)           # /auth/*
app.include_router(algorithms.router)     # /algorithms/*
app.include_router(portfolio.router)      # /portfolio/*
app.include_router(market.router)         # /market/*
```

#### 2. **Market Data Service** (`server/services/market_data.py`)
- Fetches real-time stock prices using `yfinance`
- Retrieves historical OHLCV data
- Provides stock information (sector, P/E, market cap)

**Flow**:
```
Client Request → Market Router → Market Data Service → yfinance API → Response
```

#### 3. **Quantitative Algorithms** (`quant/` directory)
- **Black-Scholes** (`blackscholes.py`): Option pricing model
- **Greeks** (`greeks.py`): Delta, Gamma, Vega, Theta, Rho
- **Monte Carlo** (`montecarlo.py`): Price simulation
- **Risk Metrics** (`risk.py`): VaR, Expected Shortfall

**Flow**:
```
Client Request → Algorithms Router → Algorithm Service → Quant Module → NumPy/SciPy → Response
```

#### 4. **Portfolio Management** (`server/services/portfolio.py`)
- Creates and manages user portfolios
- Tracks positions (symbol, quantity, average price)
- Calculates P&L, allocation percentages
- Uses SQLAlchemy ORM for database operations

**Database Schema**:
```sql
users
  ├── id (PK)
  ├── username
  ├── email
  └── password_hash

portfolios
  ├── id (PK)
  ├── user_id (FK → users.id)
  └── created_at

positions
  ├── id (PK)
  ├── portfolio_id (FK → portfolios.id)
  ├── symbol
  ├── qty
  └── avg_price
```

#### 5. **Authentication** (`server/routers/auth.py`)
- JWT-based authentication
- User registration and login
- Password hashing with bcrypt
- Token expiration (30 days)

**Flow**:
```
Register/Login → Hash Password → Create JWT → Return Token
Protected Route → Verify JWT → Extract User → Process Request
```

### Frontend Architecture

#### 1. **Component Structure**
```
App.jsx (Router)
  ├── Layout (Sidebar Navigation)
  │   ├── Dashboard (Market Overview)
  │   ├── AssetDetail (Ticker Analysis)
  │   ├── Portfolio (Holdings)
  │   └── UserProfile
  └── Auth
      ├── Login
      └── Register
```

#### 2. **Real-time Updates**
- Server-Sent Events (SSE) for live price streaming
- Endpoint: `/market/stream?symbols=AAPL,MSFT`
- Updates every 2 seconds

#### 3. **Charting**
- Plotly.js for candlestick charts
- Technical indicators: SMA, EMA, RSI, MACD
- Multi-timeframe support (1m, 5m, 15m, 1h, 1D, 1W)

---

## ☁️ Cloud Deployment Requirements

### Prerequisites

1. **Cloud Provider Account**
   - Azure, AWS, or Google Cloud Platform
   - Container registry (ACR, ECR, or GCR)
   - Container hosting service

2. **Local Requirements**
   - Docker installed
   - Cloud CLI tools (Azure CLI, AWS CLI, or gcloud)
   - Git for version control

3. **Resources Needed**
   - Container registry (for storing Docker images)
   - Compute instance (Container Instances, ECS, Cloud Run)
   - Database (optional, for production - PostgreSQL recommended)
   - Domain name (optional, for custom domain)

### Environment Variables

Create a `.env` file or set in cloud platform:

```env
# Database
DATABASE_URL=sqlite:///./athenaa.db  # Dev
# DATABASE_URL=postgresql://user:pass@host:5432/dbname  # Production

# Security
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200  # 30 days

# Server
PYTHONUNBUFFERED=1
PORT=8000

# CORS (Production - restrict to your domain)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Optional: API Keys
YFINANCE_CACHE_ENABLED=true
```

### Docker Image Requirements

- **Base Image**: Python 3.12-slim
- **Frontend Builder**: Node.js 18
- **Port**: 8000
- **Health Check**: Configured in Dockerfile
- **Size**: ~500MB (optimized)

---

## 🚀 Step-by-Step Cloud Deployment

### Option 1: Azure Container Instances (ACI)

#### Step 1: Build and Push to Azure Container Registry

```bash
# Login to Azure
az login

# Create resource group
az group create --name athenaa-rg --location eastus

# Create Azure Container Registry
az acr create \
  --resource-group athenaa-rg \
  --name athenaaregistry \
  --sku Basic \
  --admin-enabled true

# Login to ACR
az acr login --name athenaaregistry

# Build and push image
az acr build \
  --registry athenaaregistry \
  --image athenaa:latest \
  --file Dockerfile .
```

#### Step 2: Deploy to Container Instances

```bash
# Get ACR login server
ACR_LOGIN_SERVER=$(az acr show --name athenaaregistry --query loginServer --output tsv)

# Deploy container
az container create \
  --resource-group athenaa-rg \
  --name athenaa-app \
  --image ${ACR_LOGIN_SERVER}/athenaa:latest \
  --cpu 2 \
  --memory 4 \
  --registry-login-server ${ACR_LOGIN_SERVER} \
  --registry-username $(az acr credential show --name athenaaregistry --query username --output tsv) \
  --registry-password $(az acr credential show --name athenaaregistry --query passwords[0].value --output tsv) \
  --dns-name-label athenaa-app \
  --ports 8000 \
  --environment-variables \
    PYTHONUNBUFFERED=1 \
    SECRET_KEY=$(openssl rand -hex 32)

# Get public IP
az container show \
  --resource-group athenaa-rg \
  --name athenaa-app \
  --query ipAddress.fqdn \
  --output tsv
```

#### Step 3: Access Your Application

```
http://<dns-name-label>.<region>.azurecontainer.io:8000
```

### Option 2: Azure App Service

```bash
# Create App Service plan
az appservice plan create \
  --name athenaa-plan \
  --resource-group athenaa-rg \
  --is-linux \
  --sku B2

# Create web app
az webapp create \
  --resource-group athenaa-rg \
  --plan athenaa-plan \
  --name athenaa-app \
  --deployment-container-image-name ${ACR_LOGIN_SERVER}/athenaa:latest

# Configure app settings
az webapp config appsettings set \
  --resource-group athenaa-rg \
  --name athenaa-app \
  --settings \
    SECRET_KEY=$(openssl rand -hex 32) \
    PYTHONUNBUFFERED=1

# Enable continuous deployment
az webapp deployment container config \
  --name athenaa-app \
  --resource-group athenaa-rg \
  --enable-cd true
```

### Option 3: Google Cloud Run

```bash
# Set project
gcloud config set project YOUR_PROJECT_ID

# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/athenaa:latest

# Deploy to Cloud Run
gcloud run deploy athenaa \
  --image gcr.io/YOUR_PROJECT_ID/athenaa:latest \
  --platform managed \
  --region us-central1 \
  --port 8000 \
  --memory 2Gi \
  --cpu 2 \
  --allow-unauthenticated \
  --set-env-vars SECRET_KEY=$(openssl rand -hex 32),PYTHONUNBUFFERED=1
```

### Option 4: AWS ECS/Fargate

```bash
# Create ECR repository
aws ecr create-repository --repository-name athenaa

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and push
docker build -t athenaa .
docker tag athenaa:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/athenaa:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/athenaa:latest

# Create ECS task definition and service (use AWS Console or CloudFormation)
```

### Option 5: Docker Hub + Any Platform

```bash
# Login to Docker Hub
docker login

# Build image
docker build -t yourusername/athenaa:latest .

# Push to Docker Hub
docker push yourusername/athenaa:latest

# Deploy on any platform using:
# Image: yourusername/athenaa:latest
```

---

## ⚙️ Environment Configuration

### Development Environment

```bash
# 1. Clone repository
git clone <your-repo-url>
cd kickass

# 2. Create virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # macOS/Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set environment variables (optional)
# Create .env file or export variables
export SECRET_KEY="dev-secret-key"
export DATABASE_URL="sqlite:///./athenaa.db"

# 5. Run backend
python -m uvicorn server.main:app --reload --host 0.0.0.0 --port 8000

# 6. Run frontend (separate terminal)
cd frontend
npm install --legacy-peer-deps
npm run dev
```

### Production Environment

1. **Use PostgreSQL instead of SQLite**
   ```env
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   ```

2. **Set strong SECRET_KEY**
   ```bash
   openssl rand -hex 32
   ```

3. **Restrict CORS**
   ```python
   allow_origins=["https://yourdomain.com"]
   ```

4. **Enable HTTPS**
   - Use load balancer with SSL certificate
   - Or use platform-managed HTTPS (App Service, Cloud Run)

5. **Set up monitoring**
   - Application Insights (Azure)
   - CloudWatch (AWS)
   - Cloud Monitoring (GCP)

---

## 📡 API Documentation

### Base URL
- Local: `http://localhost:8000`
- Production: `https://yourdomain.com`

### Authentication Endpoints

```bash
# Register new user
POST /auth/register
Body: {
  "username": "user123",
  "email": "user@example.com",
  "password": "securepassword",
  "full_name": "John Doe"
}
Response: {
  "access_token": "jwt-token",
  "token_type": "bearer",
  "user": {...}
}

# Login
POST /auth/login
Body: {
  "username": "user123",
  "password": "securepassword"
}
Response: {
  "access_token": "jwt-token",
  "token_type": "bearer",
  "user": {...}
}

# Get current user
GET /auth/me
Headers: Authorization: Bearer <token>
```

### Market Data Endpoints

```bash
# Get current price
GET /market/price/AAPL
Response: {"symbol": "AAPL", "price": 278.12}

# Get stock info
GET /market/info/AAPL
Response: {
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "sector": "Technology",
  "market_cap": 4500000000000,
  "pe_ratio": 28.5
}

# Get historical data
GET /market/history/AAPL?period=1y
Response: {
  "symbol": "AAPL",
  "period": "1y",
  "data": [
    {"Date": "2024-01-01", "Open": 150.0, "High": 152.0, "Low": 149.0, "Close": 151.0, "Volume": 1000000}
  ]
}

# Real-time stream (SSE)
GET /market/stream?symbols=AAPL,MSFT
Response: Server-Sent Events stream
```

### Algorithm Endpoints

```bash
# Black-Scholes option pricing
POST /algorithms/black_scholes
Body: {
  "S": 100.0,  # Stock price
  "K": 105.0,  # Strike price
  "T": 0.25,   # Time to expiration (years)
  "r": 0.05,   # Risk-free rate
  "sigma": 0.2  # Volatility
}
Response: {"price": 2.45}

# Calculate Greeks
POST /algorithms/greeks
Body: {same as above}
Response: {
  "delta": 0.45,
  "gamma": 0.02,
  "vega": 0.15,
  "theta": -0.05,
  "rho": 0.10
}

# Monte Carlo simulation
POST /algorithms/monte_carlo/simulate
Body: {
  "S": 100.0,
  "T": 1.0,
  "r": 0.05,
  "sigma": 0.2,
  "n": 10000
}
Response: {
  "mean": 105.0,
  "std": 20.0,
  "sample": [102.5, 103.2, ...]
}

# Value at Risk
POST /algorithms/monte_carlo/var
Body: {same as monte_carlo}
Response: {
  "var_95": -0.15,
  "var_99": -0.25,
  "expected_shortfall_95": -0.18,
  "expected_shortfall_99": -0.30
}
```

### Portfolio Endpoints

```bash
# Create portfolio
POST /portfolio/create?token=<jwt-token>
Body: {
  "user_id": "1",
  "positions": [
    {"symbol": "AAPL", "qty": 10, "avg_price": 150.0},
    {"symbol": "MSFT", "qty": 5, "avg_price": 300.0}
  ]
}

# Get portfolio
GET /portfolio?token=<jwt-token>
Response: {
  "user_id": "1",
  "positions": [...]
}

# Update portfolio
PUT /portfolio?token=<jwt-token>
Body: {same as create}

# Get analytics
GET /portfolio/analytics?token=<jwt-token>
Response: {
  "total_cost": 3000.0,
  "total_value": 3500.0,
  "total_gain_loss": 500.0,
  "total_gain_loss_pct": 16.67,
  "holdings": {...},
  "allocation": {...}
}
```

### Interactive API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- OpenAPI Schema: `http://localhost:8000/openapi.json`

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :8000
kill -9 <PID>
```

#### 2. Database Locked (SQLite)
```bash
# Close all connections, then:
rm athenaa.db
# Database will be recreated on next startup
```

#### 3. Import Errors
```bash
# Reinstall dependencies
pip install --upgrade -r requirements.txt

# Check Python version (requires 3.12+)
python --version
```

#### 4. CORS Errors
- Check `allow_origins` in `server/main.py`
- Ensure frontend URL is included
- Verify frontend is making requests to correct backend URL

#### 5. Market Data Not Loading
```bash
# Test yfinance directly
python -c "import yfinance; print(yfinance.Ticker('AAPL').history(period='1d'))"

# Check network connectivity
# Verify yfinance is installed: pip install yfinance
```

#### 6. Docker Build Fails
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker build --no-cache -t athenaa:latest .
```

#### 7. Container Won't Start
```bash
# Check logs
docker logs <container-id>

# Run interactively
docker run -it athenaa:latest /bin/bash

# Check environment variables
docker run -it --env-file .env athenaa:latest
```

---

## 📊 Monitoring & Maintenance

### Health Checks

```bash
# Application health
curl http://localhost:8000/api/health

# Docker health check
docker inspect <container> | grep Health
```

### Logs

```bash
# Docker logs
docker logs -f <container-name>

# Application logs (if configured)
tail -f /var/log/athenaa/app.log
```

### Database Backup (SQLite)

```bash
# Backup database
cp athenaa.db athenaa.db.backup

# Restore
cp athenaa.db.backup athenaa.db
```

### Performance Monitoring

1. **Application Performance**
   - Response times
   - Error rates
   - Request throughput

2. **Resource Usage**
   - CPU utilization
   - Memory usage
   - Network I/O

3. **Database Performance**
   - Query execution times
   - Connection pool usage
   - Table sizes

---

## 🔐 Security Checklist

- [ ] Change `SECRET_KEY` from default
- [ ] Restrict CORS origins to production domain
- [ ] Enable HTTPS/TLS
- [ ] Use strong database passwords
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Enable SQL injection protection (using ORM)
- [ ] Set up authentication for production
- [ ] Regular security updates
- [ ] Monitor for vulnerabilities

---

## 📝 Next Steps

1. **Set up CI/CD pipeline**
   - GitHub Actions / Azure DevOps
   - Automated testing
   - Automated deployment

2. **Add monitoring**
   - Application Insights
   - Error tracking (Sentry)
   - Performance monitoring

3. **Scale horizontally**
   - Load balancer
   - Multiple container instances
   - Database connection pooling

4. **Enhance features**
   - WebSocket for real-time updates
   - Advanced charting
   - Mobile app
   - Paper trading

---

## 📞 Support

- **API Documentation**: `http://localhost:8000/docs`
- **OpenAPI Schema**: `http://localhost:8000/openapi.json`
- **GitHub Issues**: Create an issue for bugs/features

---

**Version**: 1.0.0  
**Last Updated**: February 2026  
**Status**: Production Ready ✅
