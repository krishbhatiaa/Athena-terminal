import pytest
from tests.conftest import client
from server.models import database


class TestPortfolio:
    """Tests for portfolio endpoints."""
    
    def test_create_portfolio(self):
        """Test portfolio creation."""
        payload = {
            "user_id": "test_user_1",
            "positions": [
                {"symbol": "AAPL", "qty": 10, "avg_price": 150},
                {"symbol": "MSFT", "qty": 5, "avg_price": 300}
            ]
        }
        response = client.post("/portfolio/create", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == "test_user_1"
        assert len(data["positions"]) == 2
    
    def test_get_portfolio(self):
        """Test getting portfolio."""
        # First create a portfolio
        create_payload = {
            "user_id": "test_user_2",
            "positions": [
                {"symbol": "GOOGL", "qty": 2, "avg_price": 2800}
            ]
        }
        client.post("/portfolio/create", json=create_payload)
        
        # Now retrieve it
        response = client.get("/portfolio/test_user_2")
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == "test_user_2"
        assert len(data["positions"]) == 1
        assert data["positions"][0]["symbol"] == "GOOGL"
    
    def test_portfolio_not_found(self):
        """Test getting non-existent portfolio."""
        response = client.get("/portfolio/nonexistent_user")
        assert response.status_code == 404
    
    def test_duplicate_portfolio(self):
        """Test creating duplicate portfolio."""
        payload = {
            "user_id": "test_user_3",
            "positions": []
        }
        
        # Create first portfolio
        response1 = client.post("/portfolio/create", json=payload)
        assert response1.status_code == 200
        
        # Try to create duplicate
        response2 = client.post("/portfolio/create", json=payload)
        assert response2.status_code == 400
    
    def test_update_portfolio(self):
        """Test updating portfolio."""
        # Create initial portfolio
        create_payload = {
            "user_id": "test_user_4",
            "positions": [
                {"symbol": "AAPL", "qty": 10, "avg_price": 150}
            ]
        }
        client.post("/portfolio/create", json=create_payload)
        
        # Update portfolio
        update_payload = {
            "user_id": "test_user_4",
            "positions": [
                {"symbol": "AAPL", "qty": 15, "avg_price": 155},
                {"symbol": "TSLA", "qty": 5, "avg_price": 250}
            ]
        }
        response = client.put("/portfolio/test_user_4", json=update_payload)
        assert response.status_code == 200
        data = response.json()
        assert len(data["positions"]) == 2
    
    def test_portfolio_analytics(self):
        """Test portfolio analytics."""
        # Create portfolio
        create_payload = {
            "user_id": "test_user_5",
            "positions": [
                {"symbol": "AAPL", "qty": 10, "avg_price": 150},
                {"symbol": "MSFT", "qty": 5, "avg_price": 300}
            ]
        }
        client.post("/portfolio/create", json=create_payload)
        
        # Get analytics
        response = client.get("/portfolio/test_user_5/analytics")
        assert response.status_code == 200
        data = response.json()
        
        assert "user_id" in data
        assert "total_cost" in data
        assert "total_value" in data
        assert "total_gain_loss" in data
        assert "holdings" in data
        assert "allocation" in data
        
        # Verify total_cost calculation
        expected_cost = (10 * 150) + (5 * 300)  # 3000
        assert data["total_cost"] == expected_cost
