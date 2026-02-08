import yfinance as yf
import pandas as pd


def fetch_stock_price(symbol: str):
    """Fetch current stock price."""
    try:
        ticker = yf.Ticker(symbol)
        data = ticker.history(period="1d")
        if data.empty:
            return None
        return float(data["Close"].iloc[-1])
    except:
        return None


def fetch_historical_ohlc(symbol: str, period="1y"):
    """Fetch OHLC historical data. Period: '1mo', '3mo', '6mo', '1y', '5y', 'max'."""
    try:
        ticker = yf.Ticker(symbol)
        data = ticker.history(period=period)
        if data.empty:
            return None
        # Return as list of dicts for JSON serialization
        data = data.reset_index()
        data["Date"] = data["Date"].astype(str)
        return data[["Date", "Open", "High", "Low", "Close", "Volume"]].to_dict("records")
    except:
        return None


def fetch_dividend_history(symbol: str):
    """Fetch dividend history."""
    try:
        ticker = yf.Ticker(symbol)
        return ticker.dividends.to_dict()
    except:
        return {}


def fetch_stock_info(symbol: str):
    """Fetch basic stock info: sector, market cap, P/E ratio, etc."""
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        return {
            "symbol": symbol,
            "name": info.get("longName", ""),
            "sector": info.get("sector", ""),
            "market_cap": info.get("marketCap"),
            "pe_ratio": info.get("trailingPE"),
            "dividend_yield": info.get("dividendYield"),
            "52_week_high": info.get("fiftyTwoWeekHigh"),
            "52_week_low": info.get("fiftyTwoWeekLow"),
        }
    except:
        return None
