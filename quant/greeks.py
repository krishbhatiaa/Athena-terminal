import math
from scipy.stats import norm


def d1_d2(S, K, T, r, sigma):
    """Calculate d1 and d2 for Black-Scholes model."""
    if T == 0 or sigma == 0:
        return None, None
    d1 = (math.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * math.sqrt(T))
    d2 = d1 - sigma * math.sqrt(T)
    return d1, d2


def delta(S, K, T, r, sigma):
    """Delta: rate of change of option price w.r.t. stock price."""
    if T == 0:
        return 1.0 if S > K else 0.0
    if sigma == 0:
        return 1.0 if S > K * math.exp(-r * T) else 0.0
    d1, _ = d1_d2(S, K, T, r, sigma)
    return norm.cdf(d1)


def gamma(S, K, T, r, sigma):
    """Gamma: rate of change of delta w.r.t. stock price."""
    if T == 0 or sigma == 0:
        return 0.0
    d1, _ = d1_d2(S, K, T, r, sigma)
    return norm.pdf(d1) / (S * sigma * math.sqrt(T))


def vega(S, K, T, r, sigma):
    """Vega: rate of change of option price w.r.t. volatility (per 1% change)."""
    if T == 0 or sigma == 0:
        return 0.0
    d1, _ = d1_d2(S, K, T, r, sigma)
    return S * norm.pdf(d1) * math.sqrt(T) / 100.0


def theta(S, K, T, r, sigma):
    """Theta: rate of change of option price w.r.t. time (per day)."""
    if T == 0 or sigma == 0:
        return 0.0
    d1, d2 = d1_d2(S, K, T, r, sigma)
    term1 = -S * norm.pdf(d1) * sigma / (2 * math.sqrt(T))
    term2 = -r * K * math.exp(-r * T) * norm.cdf(d2)
    return (term1 + term2) / 365.0


def rho(S, K, T, r, sigma):
    """Rho: rate of change of option price w.r.t. interest rate (per 1% change)."""
    if T == 0 or sigma == 0:
        return 0.0
    _, d2 = d1_d2(S, K, T, r, sigma)
    return K * T * math.exp(-r * T) * norm.cdf(d2) / 100.0
