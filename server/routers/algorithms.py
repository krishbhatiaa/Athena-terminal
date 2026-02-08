from fastapi import APIRouter
from server.models.schemas import (
    OptionRequest, OptionResponse, MonteCarloRequest, MonteCarloResponse,
    GreeksRequest, GreeksResponse, RiskRequest, RiskResponse, StockPriceRequest
)
from server.services import algorithms as algo_svc
from server.utils.plotting import timeseries_plotly, distribution_histogram
from quant import greeks, risk
import numpy as np

router = APIRouter()

@router.post("/black_scholes", response_model=OptionResponse)
async def black_scholes(req: OptionRequest):
    price = algo_svc.black_scholes_price(req.S, req.K, req.T, req.r, req.sigma)
    return OptionResponse(price=price)

@router.post("/greeks", response_model=GreeksResponse)
async def calculate_greeks(req: GreeksRequest):
    delta = greeks.delta(req.S, req.K, req.T, req.r, req.sigma)
    gamma = greeks.gamma(req.S, req.K, req.T, req.r, req.sigma)
    vega = greeks.vega(req.S, req.K, req.T, req.r, req.sigma)
    theta = greeks.theta(req.S, req.K, req.T, req.r, req.sigma)
    rho = greeks.rho(req.S, req.K, req.T, req.r, req.sigma)
    return GreeksResponse(delta=delta, gamma=gamma, vega=vega, theta=theta, rho=rho)

@router.post("/monte_carlo/simulate", response_model=MonteCarloResponse)
async def montecarlo(req: MonteCarloRequest):
    samples = algo_svc.montecarlo_simulate(req.S, req.T, req.r, req.sigma, req.n)
    # return summary and a small sample
    return MonteCarloResponse(mean=float(samples.mean()), std=float(samples.std()), sample=samples[:min(20, len(samples))].tolist())

@router.post("/monte_carlo/plot")
async def montecarlo_plot(req: MonteCarloRequest):
    samples = algo_svc.montecarlo_simulate(req.S, req.T, req.r, req.sigma, req.n)
    fig = timeseries_plotly(samples)
    return fig.to_dict()

@router.post("/monte_carlo/var")
async def monte_carlo_var(req: MonteCarloRequest):
    samples = algo_svc.montecarlo_simulate(req.S, req.T, req.r, req.sigma, req.n)
    returns = (samples - req.S) / req.S
    var_95 = risk.var_percentile(returns, confidence=0.95)
    var_99 = risk.var_percentile(returns, confidence=0.99)
    es_95 = risk.expected_shortfall(returns, confidence=0.95)
    es_99 = risk.expected_shortfall(returns, confidence=0.99)
    return {
        "var_95": float(var_95),
        "var_99": float(var_99),
        "expected_shortfall_95": float(es_95),
        "expected_shortfall_99": float(es_99),
        "mean_return": float(returns.mean()),
        "std_return": float(returns.std())
    }

@router.post("/monte_carlo/distribution")
async def monte_carlo_distribution(req: MonteCarloRequest):
    samples = algo_svc.montecarlo_simulate(req.S, req.T, req.r, req.sigma, req.n)
    fig = distribution_histogram(samples)
    return fig.to_dict()
