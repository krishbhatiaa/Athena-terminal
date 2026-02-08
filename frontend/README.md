# ATHENA Terminal - Frontend

This folder contains a React + Vite UI prototype for the ATHENA terminal. It is designed as a desktop-first, institutional-grade interface.

Quick start

1. Install dependencies

```bash
cd frontend
npm install
```

2. Run dev server

```bash
npm run dev
```

3. Build for production

```bash
npm run build
```

Notes
- The Vite dev server proxies `/algorithms`, `/market`, and `/portfolio` to `http://127.0.0.1:8000` for local integration with the backend.
- Colors and typography follow the strict design palette provided (deep charcoal background, off-white text, emerald/crimson/amber accents).

Next steps
- Add real streaming updates (WebSocket/Server-Sent Events)
- Add proper order routing and risk checks
- Replace mock data with backend endpoints for tickers, order book, trades
