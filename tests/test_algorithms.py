import pytest
from tests.conftest import client


class TestBlackScholes:
    """Tests for Black-Scholes option pricing."""
    
    def test_black_scholes_basic(self):
        """Test basic Black-Scholes calculation."""
        payload = {
            "S": 100,
            "K": 100,
            "T": 1,
            "r": 0.05,
            "sigma": 0.2
        }
        response = client.post("/algorithms/black_scholes", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "price" in data
        assert data["price"] > 0
    
    def test_black_scholes_atm(self):
        """Test ATM option (S = K)."""
        payload = {
            "S": 100,
            "K": 100,
            "T": 1,
            "r": 0.05,
            "sigma": 0.2
        }
        response = client.post("/algorithms/black_scholes", json=payload)
        assert response.status_code == 200
        # ATM call should be worth around 10.45
        assert 10 < response.json()["price"] < 11
    
    def test_black_scholes_itm(self):
        """Test ITM option (S > K)."""
        payload = {
            "S": 110,
            "K": 100,
            "T": 1,
            "r": 0.05,
            "sigma": 0.2
        }
        response = client.post("/algorithms/black_scholes", json=payload)
        assert response.status_code == 200
        # ITM call should be worth more than ATM
        assert response.json()["price"] > 10.45
    
    def test_black_scholes_otm(self):
        """Test OTM option (S < K)."""
        payload = {
            "S": 90,
            "K": 100,
            "T": 1,
            "r": 0.05,
            "sigma": 0.2
        }
        response = client.post("/algorithms/black_scholes", json=payload)
        assert response.status_code == 200
        # OTM call should be worth less than ATM
        assert response.json()["price"] < 10.45
    
    def test_black_scholes_zero_time(self):
        """Test option with zero time to expiry."""
        payload = {
            "S": 110,
            "K": 100,
            "T": 0,
            "r": 0.05,
            "sigma": 0.2
        }
        response = client.post("/algorithms/black_scholes", json=payload)
        assert response.status_code == 200
        # Call should equal intrinsic value
        assert response.json()["price"] == 10


class TestGreeks:
    """Tests for Greeks calculation."""
    
    def test_greeks_basic(self):
        """Test Greeks calculation."""
        payload = {
            "S": 100,
            "K": 100,
            "T": 1,
            "r": 0.05,
            "sigma": 0.2
        }
        response = client.post("/algorithms/greeks", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        # Check all Greeks are present
        assert "delta" in data
        assert "gamma" in data
        assert "vega" in data
        assert "theta" in data
        assert "rho" in data
        
        # Delta should be between 0 and 1 for call
        assert 0 <= data["delta"] <= 1
        # Gamma should be positive
        assert data["gamma"] > 0
    
    def test_delta_increases_with_spot(self):
        """Test that delta increases as spot price increases."""
        payload_low = {
            "S": 90,
            "K": 100,
            "T": 1,
            "r": 0.05,
            "sigma": 0.2
        }
        payload_high = {
            "S": 110,
            "K": 100,
            "T": 1,
            "r": 0.05,
            "sigma": 0.2
        }
        
        resp_low = client.post("/algorithms/greeks", json=payload_low)
        resp_high = client.post("/algorithms/greeks", json=payload_high)
        
        delta_low = resp_low.json()["delta"]
        delta_high = resp_high.json()["delta"]
        
        assert delta_high > delta_low


class TestMonteCarlo:
    """Tests for Monte Carlo simulation."""
    
    def test_monte_carlo_simulate(self):
        """Test Monte Carlo simulation."""
        payload = {
            "S": 100,
            "T": 1,
            "r": 0.05,
            "sigma": 0.2,
            "n": 1000
        }
        response = client.post("/algorithms/monte_carlo/simulate", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        assert "mean" in data
        assert "std" in data
        assert "sample" in data
        assert len(data["sample"]) > 0
    
    def test_monte_carlo_var(self):
        """Test Monte Carlo VaR calculation."""
        payload = {
            "S": 100,
            "T": 1,
            "r": 0.05,
            "sigma": 0.2,
            "n": 5000
        }
        response = client.post("/algorithms/monte_carlo/var", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        assert "var_95" in data
        assert "var_99" in data
        assert "expected_shortfall_95" in data
        assert "expected_shortfall_99" in data
        
        # VaR99 should be worse than VaR95
        assert data["var_99"] < data["var_95"]


class TestRoot:
    """Tests for root endpoint."""
    
    def test_root(self):
        """Test root endpoint."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "Athenaa" in data["message"]
    
    def test_docs(self):
        """Test API documentation endpoint."""
        response = client.get("/docs")
        assert response.status_code == 200
