# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Local Development

```bash
# Backend
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
python -m uvicorn server.main:app --reload

# Frontend (new terminal)
cd frontend
npm install --legacy-peer-deps
npm run dev
```

**Access**:
- Frontend: http://localhost:5173
- API Docs: http://localhost:8000/docs

### 2. Docker Deployment

```bash
# Build
docker build -t athenaa:latest .

# Run
docker run -p 8000:8000 athenaa:latest
```

### 3. Cloud Deployment (Azure)

```bash
# Create resources
az group create --name athenaa-rg --location eastus
az acr create --resource-group athenaa-rg --name athenaaregistry --sku Basic

# Build and push
az acr build --registry athenaaregistry --image athenaa:latest .

# Deploy
az container create \
  --resource-group athenaa-rg \
  --name athenaa-app \
  --image athenaaregistry.azurecr.io/athenaa:latest \
  --dns-name-label athenaa-app \
  --ports 8000
```

## 📚 Documentation Files

1. **COMPLETE_GUIDE.md** - Full deployment and architecture guide
2. **CLOUD_DEPLOYMENT_CHECKLIST.md** - Step-by-step deployment checklist
3. **ARCHITECTURE_EXPLAINED.md** - Deep dive into how everything works
4. **DEPLOYMENT_GUIDE.md** - Original deployment guide
5. **README.md** - Project overview

## 🔑 Key Environment Variables

```env
SECRET_KEY=<generate-with-openssl-rand-hex-32>
DATABASE_URL=sqlite:///./athenaa.db  # or PostgreSQL for production
PYTHONUNBUFFERED=1
CORS_ORIGINS=https://yourdomain.com  # Production only
```

## 📡 Key API Endpoints

- `GET /market/price/{symbol}` - Stock price
- `GET /market/history/{symbol}` - Historical data
- `POST /algorithms/black_scholes` - Option pricing
- `GET /portfolio?token=xxx` - User portfolio
- `POST /auth/register` - Register user
- `POST /auth/login` - Login

## 🐛 Common Issues

**Port in use**: `netstat -ano | findstr :8000` then `taskkill /PID <PID> /F`

**Import errors**: `pip install --upgrade -r requirements.txt`

**Database locked**: Delete `athenaa.db`, it will recreate

## 📞 Need Help?

- Check `COMPLETE_GUIDE.md` for detailed explanations
- See `ARCHITECTURE_EXPLAINED.md` for how things work
- Review `CLOUD_DEPLOYMENT_CHECKLIST.md` for deployment steps
