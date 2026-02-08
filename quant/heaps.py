import heapq

def top_k_opportunities(trades, k=5):
    return heapq.nlargest(k, trades, key=lambda x: x["edge"])
