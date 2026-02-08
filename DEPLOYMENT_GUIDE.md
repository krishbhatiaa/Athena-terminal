# ATHENA Terminal - Deployment Guide

## Overview

**ATHENA** is a professional institutional-grade financial terminal built with:
- **Backend**: FastAPI (Python) with quantitative finance algorithms
- **Frontend**: React 18 + Vite with Plotly.js for data visualization
- **Database**: SQLite for portfolio management
- **Real-time**: Server-Sent Events (SSE) for live price updates

## Project Structure

```
kickass/
├── server/              # FastAPI backend
│   ├── main.py         # Application entry point
│   ├── routers/        # API endpoints
│   ├── services/       # Business logic (market data, portfolio)
│   ├── models/         # SQLAlchemy ORM models
│   └── utils/          # Utilities (plotting, calculations)
├── frontend/           # React + Vite application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── utils/       # Indicator calculations
│   │   ├── styles.css   # Institutional design system
│   │   └── main.jsx     # Entry point
│   └── dist/            # Production build (created by npm run build)
├── tests/              # Pytest test suite
├── Dockerfile          # Multi-stage Docker image (Node + Python)
├── docker-compose.yml  # Container orchestration
└── requirements.txt    # Python dependencies
```

## Local Development

### Prerequisites
- Python 3.12+
- Node.js 18+
- npm/yarn

### Backend Setup

```bash
# Create virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Run backend server (port 8000)
python -m uvicorn server.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install --legacy-peer-deps

# Run dev server (port 5173) with proxy to backend
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Access Application
- **Frontend**: http://localhost:5173
- **API Docs**: http://localhost:8000/docs
- **OpenAPI Schema**: http://localhost:8000/openapi.json

## Docker Deployment

### Build Docker Image

```bash
# Build from root directory
docker build -t athenaa:latest .

# Run container
docker run -p 8000:8000 athenaa:latest

# Access at http://localhost:8000
```

### Docker Compose (Development)

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

## Production Deployment Options

### Option 1: Azure Container Instances (ACI)

```bash
# Create resource group
az group create --name athenaa-rg --location eastus

# Push to Azure Container Registry
az acr create --resource-group athenaa-rg --name athenaaregistry --sku Basic
az acr build --registry athenaaregistry --image athenaa:latest .

# Deploy to ACI
az container create \
  --resource-group athenaa-rg \
  --name athenaa-app \
  --image athenaaregistry.azurecr.io/athenaa:latest \
  --ports 8000 \
  --environment-variables PYTHONUNBUFFERED=1
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
  --deployment-container-image-name athenaaregistry.azurecr.io/athenaa:latest
```

### Option 3: Docker Hub + Cloud Run

```bash
# Login to Docker Hub
docker login

# Tag and push image
docker tag athenaa:latest yourusername/athenaa:latest
docker push yourusername/athenaa:latest

# Deploy to Google Cloud Run (via UI or gcloud CLI)
gcloud run deploy athenaa \
  --image yourusername/athenaa:latest \
  --platform managed \
  --region us-central1 \
  --port 8000
```

## Environment Variables

Create a `.env` file in root directory:

```env
DATABASE_URL=sqlite:///./athenaa.db
PYTHONUNBUFFERED=1
CORS_ORIGINS=*  # Restrict in production
```

## API Endpoints

### Market Data
- `GET /market/price/{symbol}` - Current price
- `GET /market/info/{symbol}` - Stock information
- `GET /market/history/{symbol}?period=1y` - Historical OHLCV data
- `GET /market/stream?symbols=AAPL,MSFT` - Real-time price stream (SSE)

### Algorithms
- `POST /algorithms/black-scholes` - Option pricing
- `POST /algorithms/greeks` - Greeks calculation
- `POST /algorithms/monte-carlo` - Simulation/VaR
- `POST /algorithms/risk` - Risk metrics

### Portfolio
- `POST /portfolio/create` - Create portfolio
- `GET /portfolio/{user_id}` - Get portfolio
- `PUT /portfolio/{user_id}` - Update portfolio
- `GET /portfolio/{user_id}/analytics` - Portfolio analytics

## Frontend Features

### Components
- **Dashboard**: Market overview with live price updates
- **AssetDetail**: Ticker analysis with candlestick charts
- **CandlestickChart**: Multi-timeframe OHLCV with SMA/EMA/RSI/MACD overlays
- **AssetDetail Sidebar**: Order entry form, order book, recent trades
- **Portfolio**: Holdings table with P&L

### Design System
- **Color Palette**: Charcoal (#0B0F14), Off-white (#E5E7EB), Emerald (#10B981), Crimson (#DC2626), Amber (#F59E0B)
- **Typography**: Inter (body), IBM Plex Mono (tickers/symbols)
- **Animations**: Subtle transitions (180-260ms ease)
- **No**: Purple colors, gradients, or emojis

### Data Visualization
- Real-time candlestick charts via Plotly
- Technical indicators: SMA, EMA, RSI, MACD
- Volume bars and price zones
- Responsive, professional layout

## Testing

### Run Tests

```bash
# All tests
python -m pytest tests/ -v

# Specific test file
python -m pytest tests/test_algorithms.py -v

# With coverage
python -m pytest tests/ --cov=server --cov-report=html
```

### Test Results
- ✅ 14/21 tests pass (algorithms, market data)
- ⚠️ Portfolio tests require database initialization (fixture setup needed)

## Monitoring & Logs

### Health Check
```bash
curl http://localhost:8000/api/health
```

### Access Logs
```bash
# Docker container
docker logs athenaa-api

# Docker Compose
docker-compose logs -f api

# Application logs (in production)
tail -f /var/log/athenaa/app.log
```

## Performance Tips

1. **Enable Gzip Compression**
   ```python
   from fastapi import FastAPI
   from fastapi.middleware.gzip import GZIPMiddleware
   app.add_middleware(GZIPMiddleware, minimum_size=1000)
   ```

2. **Database Optimization**
   - Add indexes on frequently queried columns
   - Use connection pooling for production

3. **Frontend Optimization**
   - Code splitting for large bundles
   - Lazy loading for routes
   - Image optimization

## Security Hardening

1. **CORS Configuration**
   ```python
   allow_origins = ["https://yourdomain.com"]  # Restrict to production domain
   ```

2. **HTTPS/TLS**
   - Use load balancer (Azure Application Gateway, AWS ALB)
   - Enforce HTTPS redirects

3. **Database Security**
   - Use managed database services (Azure SQL, AWS RDS)
   - Enable encryption at rest and in transit
   - Rotate credentials regularly

4. **API Authentication** (Future Enhancement)
   - Implement JWT or OAuth2
   - Add API key management
   - Rate limiting

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 8000
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Kill process
kill -9 <PID>
```

### CORS Errors
- Check `allow_origins` in `server.main:app`
- Ensure frontend and backend ports are correct

### Charts Not Displaying
- Verify yfinance can fetch data: `python -c "import yfinance; print(yfinance.Ticker('AAPL').history())"`
- Check browser console for API errors
- Verify `/market/history/{symbol}` endpoint returns data

### Database Errors
- Check SQLite file exists: `ls -l athenaa.db`
- Verify tables created: `sqlite3 athenaa.db ".tables"`

## Next Steps

1. **Authentication**: Implement JWT-based user authentication
2. **Real-time WebSockets**: Replace SSE with WebSocket for bidirectional communication
3. **Advanced Charting**: Add more indicators (Bollinger Bands, Stochastic, ATR)
4. **Mobile App**: React Native or Flutter app for mobile trading
5. **Backtesting Engine**: Implement strategy backtesting with performance metrics
6. **Paper Trading**: Enable simulated trading for strategy testing
7. **Notifications**: Email/SMS alerts for price targets and portfolio events

## Support & Documentation

- API Documentation: http://localhost:8000/docs (Swagger UI)
- OpenAPI Schema: http://localhost:8000/openapi.json
- GitHub Issues: [Create an issue](https://github.com/yourusername/athenaa)

---

**Version**: 1.0.0  
**Last Updated**: February 2026  
**Maintainer**: Your Name
