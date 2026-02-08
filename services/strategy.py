from app.quant.black_scholes import black_scholes_call
from app.quant.monte_carlo import monte_carlo_price

def evaluate_option(option):
    bs_price = black_scholes_call(**option)
    simulations = monte_carlo_price(option["S"], option["T"],
                                     option["r"], option["sigma"])

    prob_profit = (simulations > option["K"]).mean()

    return {
        "bs_price": bs_price,
        "prob_profit": prob_profit,
        "expected_return": simulations.mean()
    }
