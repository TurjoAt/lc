# NextCTL Realtime Chat System

A full-stack real-time chat platform built for NextCTL. The solution pairs a Socket.IO-powered Node.js backend with a React + TypeScript admin dashboard and an embeddable customer chat widget.

## Project Structure

```
server/   # Express + Socket.IO backend with MongoDB persistence
admin/    # React + TypeScript admin dashboard
widget/   # Embeddable chat widget bundle
```

## Prerequisites

- Node.js 18+
- MongoDB instance (local or remote)

## Backend (`/server`)

1. Copy `.env.example` to `.env` and update connection details and secrets.
2. Install dependencies and start the server:

```bash
cd server
npm install
npm run dev
```

The server listens on `PORT` (default `4000`) and exposes both REST APIs and Socket.IO namespaces (`/` for visitors, `/admin` for authenticated admins).

### Key Features

- JWT protected admin APIs (login, session management, admin management)
- MongoDB models for admins, sessions, and messages
- Socket.IO namespaces for visitors and admins supporting typing, seen, and session lifecycle events
- Widget friendly `/api/widget/messages/:sessionId` endpoint for loading historic messages
- Security middleware: CORS, Helmet, rate limiting, and MongoDB sanitisation

## Admin Dashboard (`/admin`)

The dashboard is built with Vite + React + TypeScript using Material UI components.

```bash
cd admin
npm install
npm run dev
```

Set the following environment variables for the dashboard (e.g. via `.env` file consumed by Vite):

```
VITE_API_BASE_URL=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:4000
```

### Capabilities

- JWT authentication flow with persistent sessions
- Real-time chat interface with session list, typing indicators, and notifications
- Agent presence, logout, and theming hooks for future customisation

## Chat Widget (`/widget`)

A lightweight vanilla JS bundle that can be embedded on client sites.

```bash
cd widget
npm install
npm run build
```

Include the generated `dist/nextctl-widget.iife.js` script on any page and optionally configure it via a global `NextCTLWidgetConfig` object:

```html
<script>
  window.NextCTLWidgetConfig = {
    serverUrl: 'https://chat.nextctl.com',
    title: 'Need help?',
    subtitle: 'Our team is online and ready to chat.'
  };
</script>
<script src="/dist/nextctl-widget.iife.js"></script>
```

The widget automatically persists a visitor session, reconnects across visits, and surfaces typing + notification cues.

## Development Notes

- Designed for multi-agent use: admins connect to the `/admin` namespace and can join multiple visitor rooms.
- Future multi-tenant support can be achieved by namespacing MongoDB collections or databases per tenant.
- Dockerfiles are not included but the project structure is container ready (single `npm install` per package).

## Testing & Linting

No automated tests are provided yet. Suggested improvements include Jest test suites for the backend and React Testing Library coverage for critical UI flows.

## License

MIT
