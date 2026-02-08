import numpy as np

def simulate_price(S, T, r, sigma, n=10000):
    Z = np.random.normal(0, 1, n)
    return S * np.exp((r - 0.5 * sigma**2) * T + sigma * np.sqrt(T) * Z)
