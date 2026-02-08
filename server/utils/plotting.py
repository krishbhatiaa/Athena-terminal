import plotly.graph_objects as go
import pandas as pd

def timeseries_plotly(arr):
    fig = go.Figure()
    fig.add_trace(go.Scatter(y=arr, mode='lines', name='simulated'))
    fig.update_layout(title='Monte Carlo Simulation', xaxis_title='sample', yaxis_title='price')
    return fig

def distribution_histogram(arr):
    fig = go.Figure()
    fig.add_trace(go.Histogram(x=arr, nbinsx=50, name='distribution'))
    fig.update_layout(title='Price Distribution', xaxis_title='price', yaxis_title='frequency')
    return fig

def candlestick_chart(ohlc_data, symbol):
    """Create candlestick chart from OHLC data."""
    df = pd.DataFrame(ohlc_data)
    df['Date'] = pd.to_datetime(df['Date'])
    
    fig = go.Figure(data=[go.Candlestick(
        x=df['Date'],
        open=df['Open'],
        high=df['High'],
        low=df['Low'],
        close=df['Close']
    )])
    
    fig.update_layout(
        title=f'{symbol} OHLC',
        yaxis_title='Stock Price (USD)',
        template='plotly_white'
    )
    return fig

