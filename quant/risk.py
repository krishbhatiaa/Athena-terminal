import numpy as np


def var_percentile(returns, confidence=0.95):
    """Value at Risk using percentile method."""
    return np.percentile(returns, (1 - confidence) * 100)


def expected_shortfall(returns, confidence=0.95):
    """Expected Shortfall (CVaR): average of worst-case losses."""
    var = var_percentile(returns, confidence)
    return returns[returns <= var].mean()


def correlation_matrix(price_arrays):
    """Compute correlation matrix from list of price arrays."""
    stack = np.column_stack(price_arrays)
    returns = np.diff(stack, axis=0) / stack[:-1]
    return np.corrcoef(returns.T)
