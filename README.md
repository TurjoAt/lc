# Backend Server

This project includes a lightweight Node.js backend that exposes a WebSocket interface for chat widgets. The server uses Express for HTTP endpoints and Socket.IO for real-time messaging.

## Prerequisites

- Node.js 18+
- npm 9+

## Installation

Install dependencies:

```bash
npm install
```

## Running the server

The server exposes a health-check endpoint at `/health` and listens for WebSocket connections from chat widgets.

### Production mode

```bash
npm run start
```

### Development mode

```bash
npm run dev
```

By default the server listens on port `4000`. Set `PORT` to override this value.

### Configuring CORS

Set `WIDGET_ORIGIN` to the origin of your widget host so that browsers can connect successfully:

```bash
WIDGET_ORIGIN="https://example.com" npm run start
```

If `WIDGET_ORIGIN` is not provided the server allows `http://localhost:3000`.
