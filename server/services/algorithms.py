from quant.blackscholes import call_price
from quant.montecarlo import simulate_price
import numpy as np

def black_scholes_price(S, K, T, r, sigma):
    return call_price(S, K, T, r, sigma)

def montecarlo_simulate(S, T, r, sigma, n=10000):
    arr = simulate_price(S, T, r, sigma, n)
    return np.array(arr)
