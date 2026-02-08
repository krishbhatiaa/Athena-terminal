from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from server.services import market_data
import asyncio
import json

router = APIRouter()


@router.get("/price/{symbol}")
async def get_stock_price(symbol: str):
    """Get current stock price."""
    price = market_data.fetch_stock_price(symbol.upper())
    if price is None:
        return {"error": f"Could not fetch price for {symbol}"}
    return {"symbol": symbol.upper(), "price": price}


@router.get("/info/{symbol}")
async def get_stock_info(symbol: str):
    """Get stock info: sector, market cap, P/E, 52-week range."""
    info = market_data.fetch_stock_info(symbol.upper())
    if info is None:
        return {"error": f"Could not fetch info for {symbol}"}
    return info


@router.get("/history/{symbol}")
async def get_stock_history(symbol: str, period: str = "1y"):
    """Get OHLC history. Period: 1mo, 3mo, 6mo, 1y, 5y, max."""
    data = market_data.fetch_historical_ohlc(symbol.upper(), period)
    if data is None:
        return {"error": f"Could not fetch history for {symbol}"}
    return {"symbol": symbol.upper(), "period": period, "data": data}


@router.get("/history/{symbol}/chart")
async def get_stock_chart(symbol: str, period: str = "1y"):
    """Get candlestick chart (Plotly JSON)."""
    from server.utils.plotting import candlestick_chart
    data = market_data.fetch_historical_ohlc(symbol.upper(), period)
    if data is None:
        return {"error": f"Could not fetch history for {symbol}"}
    
    fig = candlestick_chart(data, symbol.upper())
    return fig.to_dict()


@router.get('/stream')
async def stream_prices(request: Request, symbols: str = 'AAPL'):
    """Server-Sent Events stream of latest prices for given comma-separated symbols.
    Example: /market/stream?symbols=AAPL,MSFT
    """
    symbols_list = [s.strip().upper() for s in symbols.split(',') if s.strip()]

    async def event_generator():
        while True:
            if await request.is_disconnected():
                break
            payload = {}
            for s in symbols_list:
                try:
                    price = market_data.fetch_stock_price(s)
                except Exception:
                    price = None
                payload[s] = price
            yield f"data: {json.dumps(payload)}\n\n"
            await asyncio.sleep(2)

    return StreamingResponse(event_generator(), media_type='text/event-stream')
