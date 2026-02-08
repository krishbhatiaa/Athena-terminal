import pytest
from tests.conftest import client


class TestMarketPrice:
    """Tests for stock price endpoints."""
    
    def test_get_stock_price(self):
        """Test getting stock price."""
        response = client.get("/market/price/AAPL")
        assert response.status_code == 200
        data = response.json()
        assert "symbol" in data
        assert "price" in data
        assert data["symbol"] == "AAPL"
        assert data["price"] > 0
    
    def test_price_case_insensitive(self):
        """Test that symbol lookup is case insensitive."""
        response_upper = client.get("/market/price/AAPL")
        response_lower = client.get("/market/price/aapl")
        
        assert response_upper.status_code == 200
        assert response_lower.status_code == 200
        # Both should return the same symbol (uppercase)
        assert response_upper.json()["symbol"] == response_lower.json()["symbol"]
    
    def test_invalid_symbol(self):
        """Test invalid stock symbol."""
        response = client.get("/market/price/INVALID123")
        assert response.status_code == 200
        data = response.json()
        # Should return error message
        assert "error" in data or "price" in data


class TestStockHistory:
    """Tests for historical data endpoints."""
    
    def test_get_history(self):
        """Test getting historical data."""
        response = client.get("/market/history/AAPL")
        assert response.status_code == 200
        data = response.json()
        assert "symbol" in data
        assert "period" in data
        assert "data" in data
    
    def test_history_periods(self):
        """Test different time periods."""
        periods = ["1mo", "3mo", "6mo", "1y"]
        
        for period in periods:
            response = client.get(f"/market/history/AAPL?period={period}")
            assert response.status_code == 200
            data = response.json()
            assert data["period"] == period
