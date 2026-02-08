import math
from scipy.stats import norm


def call_price(S, K, T, r, sigma):
    """Black-Scholes European call option price.

    Handles edge cases where `T` or `sigma` may be zero by returning
    the intrinsic / discounted intrinsic value.
    """
    # validate inputs
    if T is None or T < 0:
        raise ValueError("T (time to expiry) must be >= 0")
    if sigma is None or sigma < 0:
        raise ValueError("sigma (volatility) must be >= 0")

    # If no time left, option value is immediate payoff
    if T == 0:
        return max(S - K, 0.0)

    # If zero volatility, future stock price is known deterministically
    if sigma == 0:
        # deterministic growth: S * exp(r*T)
        # call value is discounted payoff under risk-free growth
        return max(S - K * math.exp(-r * T), 0.0)

    d1 = (math.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * math.sqrt(T))
    d2 = d1 - sigma * math.sqrt(T)
    return S * norm.cdf(d1) - K * math.exp(-r * T) * norm.cdf(d2)
