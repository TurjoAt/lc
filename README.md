# LiveChat Widget

This project bundles a React-based live chat widget that connects to a Socket.IO backend and can be embedded on any host site.

## Getting started

```bash
npm install
npm run dev
```

The development server serves the widget in library mode so you can iterate on the UI. Use `npm run dev` and visit the printed URL to develop in isolation.

## Building the embeddable script

Run the Vite production build to generate a single IIFE bundle at `dist/livechat-widget.js`:

```bash
npm run build
```

The bundle exposes a global initializer under `window.LiveChatWidget.init(options)`. Calling the initializer renders the floating widget, connects it to your Socket.IO server, and returns an object with the active Socket.IO client and a `destroy()` helper.

### Initialization options

| Option | Type | Required | Description |
| ------ | ---- | -------- | ----------- |
| `serverUrl` | `string` | ✅ | Base URL of your Socket.IO backend (e.g. `https://your-app.example.com`). |
| `room` | `string` | ❌ | Optional room/channel identifier to join after connecting. |
| `title` | `string` | ❌ | Custom header text for the widget. |
| `container` | `HTMLElement` | ❌ | Use an existing DOM node instead of the default floating mount. |
| `socketOptions` | `SocketOptions` | ❌ | Additional options forwarded to `socket.io-client`'s `io()` factory. |

The initializer returns:

```ts
const { socket, destroy } = window.LiveChatWidget.init({
  serverUrl: "https://your-app.example.com",
  room: "support",
  title: "Need help?"
});
```

Call `destroy()` to unmount the React tree, disconnect the socket, and remove the injected DOM node when you no longer need the widget.

## Embedding in a host page

1. Copy `dist/livechat-widget.js` to a location your site can serve.
2. Load it with a standard `<script>` tag.
3. Call the initializer with your configuration.

```html
<script src="/path/to/livechat-widget.js"></script>
<script>
  window.LiveChatWidget.init({
    serverUrl: "https://your-app.example.com",
    room: "marketing",
    title: "Chat with us"
  });
</script>
```

The widget floats in the bottom-right corner and includes styling that isolates it from most host page layouts.

## Demo page

A static page at `demo/index.html` references the built bundle and calls the initializer for manual testing. After running `npm run build`, open the file directly in a browser or serve it via a simple static server to verify the widget end-to-end.

## Socket events

The widget expects a Socket.IO backend that supports the following events:

- `message`: Emitted by both client and server. Payload shape `{ text: string, room?: string, role?: "user" | "agent" }`.
- `typing`: Emitted by both client and server. Payload shape `{ isTyping: boolean, room?: string, role?: "user" | "agent" }`.
- `join` / `leave`: Emitted by the client when `room` is provided to subscribe/unsubscribe from a channel.

Adjust the event names in `widget/src/index.tsx` to match your backend if needed.

## License

MIT
