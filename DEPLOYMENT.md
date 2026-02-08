# Athenaa - Deployment Guide

## Quick Start with Docker

### Prerequisites
- Docker & Docker Compose installed
- Python 3.12+ (for local development)

### Option 1: Local Development

```bash
# Clone the repository
git clone <repo-url>
cd kickass

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the backend
uvicorn server.main:app --host 127.0.0.1 --port 8000 --reload

# Access the dashboard at http://127.0.0.1:8000
```

### Option 2: Docker Compose (Recommended)

```bash
# Start the application
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop the application
docker-compose down
```

The API will be available at `http://localhost:8000`
- Dashboard: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Option 3: Docker Build & Run

```bash
# Build image
docker build -t athenaa:latest .

# Run container
docker run -p 8000:8000 -e PYTHONUNBUFFERED=1 athenaa:latest
```

## Environment Variables

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

## API Endpoints

### Algorithms
- `POST /algorithms/black_scholes` - Option pricing
- `POST /algorithms/greeks` - Greeks calculation
- `POST /algorithms/monte_carlo/simulate` - Monte Carlo simulation
- `POST /algorithms/monte_carlo/var` - Value at Risk

### Market Data
- `GET /market/price/{symbol}` - Stock price
- `GET /market/info/{symbol}` - Stock info
- `GET /market/history/{symbol}` - Historical OHLC data
- `GET /market/history/{symbol}/chart` - Candlestick chart

### Portfolio
- `POST /portfolio/create` - Create portfolio
- `GET /portfolio/{user_id}` - Get portfolio
- `PUT /portfolio/{user_id}` - Update portfolio
- `GET /portfolio/{user_id}/analytics` - Portfolio analytics

## Testing

```bash
# Run tests
pytest tests/ -v

# Run tests with coverage
pytest tests/ -v --cov=server --cov=quant
```

## Deployment to Cloud

### Azure Container Instances
```bash
az container create \
  --resource-group myResourceGroup \
  --name athenaa-api \
  --image <registry>/athenaa:latest \
  --ports 8000 \
  --environment-variables DATABASE_URL=sqlite:///./athenaa.db
```

### Azure App Service
```bash
# Create app service
az appservice plan create \
  --name athenaa-plan \
  --resource-group myResourceGroup \
  --sku B1 --is-linux

# Create web app
az webapp create \
  --resource-group myResourceGroup \
  --plan athenaa-plan \
  --name athenaa-app \
  --deployment-container-image-name <registry>/athenaa:latest
```

## Production Checklist

- [ ] Set `API_RELOAD=false` in `.env`
- [ ] Use PostgreSQL instead of SQLite
- [ ] Set up proper CORS origins
- [ ] Enable HTTPS
- [ ] Set up logging & monitoring
- [ ] Add database backups
- [ ] Configure rate limiting
- [ ] Add authentication
- [ ] Use environment-specific configurations

## Troubleshooting

### Port already in use
```bash
# Check what's using port 8000
lsof -i :8000
# On Windows:
netstat -ano | findstr :8000
```

### Database locked error
```bash
# Remove stale database
rm athenaa.db
# The app will recreate it on startup
```

### Module import errors
```bash
# Reinstall dependencies
pip install --upgrade -r requirements.txt
```

## Support

For issues and feature requests, please open an issue on GitHub.
