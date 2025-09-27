import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import "./styles.css";

type Role = "user" | "agent" | "system";

type ChatMessage = {
  id: string;
  role: Role;
  text: string;
  timestamp: number;
};

type SocketMessagePayload = {
  id?: string;
  role?: Role;
  text: string;
  timestamp?: number;
  room?: string;
};

type TypingPayload = {
  role?: Role;
  isTyping: boolean;
  room?: string;
};

type LiveChatWidgetOptions = {
  /**
   * Socket.IO server URL (e.g. https://your-app.example.com)
   */
  serverUrl: string;
  /**
   * Optional room or channel identifier to join.
   */
  room?: string;
  /**
   * Optional element to use as the mounting container.
   * The widget will append a new element when not provided.
   */
  container?: HTMLElement;
  /**
   * Text shown in the header of the widget.
   */
  title?: string;
  /**
   * Additional Socket.IO client options.
   */
  socketOptions?: Parameters<typeof io>[1];
};

type ChatWidgetProps = {
  socket: Socket;
  title?: string;
  room?: string;
};

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const ChatWidget: React.FC<ChatWidgetProps> = ({ socket, title = "Live Chat", room }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [agentTyping, setAgentTyping] = useState(false);

  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    if (room) {
      socket.emit("join", { room });
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      if (room) {
        socket.emit("leave", { room });
      }
    };
  }, [room, socket]);

  useEffect(() => {
    const handleMessage = (payload: SocketMessagePayload) => {
      if (payload.room && room && payload.room !== room) {
        return;
      }

      const message: ChatMessage = {
        id: payload.id ?? generateId(),
        role: payload.role ?? "agent",
        text: payload.text,
        timestamp: payload.timestamp ?? Date.now(),
      };

      setMessages((prev) => [...prev, message]);
    };

    let typingTimeout: number | undefined;

    const handleTyping = (payload: TypingPayload) => {
      if (payload.room && room && payload.room !== room) {
        return;
      }

      const role = payload.role ?? "agent";
      if (role === "user") {
        return;
      }

      setAgentTyping(payload.isTyping);

      if (payload.isTyping) {
        window.clearTimeout(typingTimeout);
        typingTimeout = window.setTimeout(() => setAgentTyping(false), 2000);
      } else {
        window.clearTimeout(typingTimeout);
      }
    };

    socket.on("message", handleMessage);
    socket.on("typing", handleTyping);

    return () => {
      socket.off("message", handleMessage);
      socket.off("typing", handleTyping);
      window.clearTimeout(typingTimeout);
    };
  }, [room, socket]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || !isConnected) {
      return;
    }

    const outgoing: ChatMessage = {
      id: generateId(),
      role: "user",
      text: trimmed,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, outgoing]);
    socket.emit("message", { text: trimmed, room, role: "user" });
    socket.emit("typing", { isTyping: false, room, role: "user" });
    setInput("");
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInput(value);
    socket.emit("typing", { isTyping: value.trim().length > 0, room, role: "user" });
  };

  return (
    <div className="lc-widget-container">
      <header className="lc-widget-header">
        <h1 className="lc-widget-title">{title}</h1>
        <span>{isConnected ? "● Online" : "○ Offline"}</span>
      </header>
      <div className="lc-widget-body">
        {messages.map((message) => (
          <div key={message.id} className={`lc-message-row ${message.role === "user" ? "user" : "agent"}`}>
            <div className="lc-message-bubble">{message.text}</div>
          </div>
        ))}
      </div>
      {agentTyping && <div className="lc-typing-indicator">Support is typing…</div>}
      <div className="lc-input-bar">
        <form className="lc-input-form" onSubmit={handleSubmit}>
          <input
            className="lc-input-field"
            value={input}
            onChange={handleInputChange}
            placeholder={isConnected ? "Type your message" : "Connecting…"}
            disabled={!isConnected}
          />
          <button className="lc-send-button" type="submit" disabled={!isConnected || input.trim().length === 0}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export function createLiveChatWidget(options: LiveChatWidgetOptions) {
  if (typeof document === "undefined") {
    throw new Error("createLiveChatWidget can only be used in a browser environment");
  }

  const { container, serverUrl, socketOptions, ...rest } = options;

  const mount = container ?? document.createElement("div");
  if (!container) {
    mount.classList.add("lc-widget-host");
    document.body.appendChild(mount);
  }

  const socket = io(serverUrl, {
    transports: ["websocket", "polling"],
    autoConnect: true,
    ...socketOptions,
  });

  const root = createRoot(mount);
  root.render(
    <React.StrictMode>
      <ChatWidget socket={socket} {...rest} />
    </React.StrictMode>
  );

  return {
    destroy: () => {
      root.unmount();
      socket.disconnect();
      if (!container && mount.parentNode) {
        mount.parentNode.removeChild(mount);
      }
    },
    socket,
  };
}

declare global {
  interface Window {
    LiveChatWidget?: {
      init: typeof createLiveChatWidget;
    };
  }
}

if (typeof window !== "undefined") {
  window.LiveChatWidget = {
    init: createLiveChatWidget,
  };
}

export type { LiveChatWidgetOptions };
