# Athenaa Backend

Mini-Bloomberg terminal with stock trading algorithms, portfolio management, and market data.

## Setup

```powershell
pip install -r requirements.txt
python -m server.main
```

Open http://127.0.0.1:8000/docs for interactive API docs.

## Endpoints

### Algorithms
- **POST** `/algorithms/black_scholes` – European call option price
- **POST** `/algorithms/greeks` – Delta, gamma, vega, theta, rho
- **POST** `/algorithms/monte_carlo/simulate` – Monte Carlo price simulation
- **POST** `/algorithms/monte_carlo/plot` – Simulation plot (Plotly JSON)
- **POST** `/algorithms/monte_carlo/var` – Value at Risk, Expected Shortfall
- **POST** `/algorithms/monte_carlo/distribution` – Price distribution histogram

### Portfolio
- **POST** `/portfolio/create` – Create portfolio
- **GET** `/portfolio/{user_id}` – Get portfolio
- **PUT** `/portfolio/{user_id}` – Update portfolio
- **GET** `/portfolio/{user_id}/analytics` – P&L, allocation, holdings

### Market Data
- **GET** `/market/price/{symbol}` – Current stock price
- **GET** `/market/info/{symbol}` – Stock info (sector, market cap, P/E, etc.)
- **GET** `/market/history/{symbol}?period=1y` – OHLC historical data
- **GET** `/market/history/{symbol}/chart?period=1y` – Candlestick chart

## Features

✅ Black-Scholes option pricing  
✅ Greeks (delta, gamma, vega, theta, rho)  
✅ Monte Carlo simulations with risk metrics (VaR, ES)  
✅ Portfolio management with SQLite persistence  
✅ Live stock prices & historical data (Yahoo Finance)  
✅ Portfolio P&L and allocation analytics  
✅ Candlestick charts and distributions  
✅ CORS enabled for frontend integration

## Quick Test

```powershell
# Greeks
Invoke-RestMethod -Method Post -Uri 'http://127.0.0.1:8000/algorithms/greeks' -ContentType 'application/json' -Body '{"S":100,"K":100,"T":1,"r":0.01,"sigma":0.2}'

# Stock price
Invoke-RestMethod -Method Get -Uri 'http://127.0.0.1:8000/market/price/AAPL'

# Portfolio analytics
Invoke-RestMethod -Method Get -Uri 'http://127.0.0.1:8000/portfolio/alice/analytics'
```

