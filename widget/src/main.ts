import { io, Socket } from 'socket.io-client';

type WidgetConfig = {
  serverUrl?: string;
  title?: string;
  subtitle?: string;
};

type Message = {
  _id: string;
  sessionId: string;
  senderType: 'user' | 'admin';
  content: string;
  timestamp: string;
};

const SESSION_KEY = 'nextctl.session';

const createElement = <K extends keyof HTMLElementTagNameMap>(tag: K, className?: string) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  return element;
};

class NextCTLWidget {
  private root: HTMLElement;
  private socket: Socket | null = null;
  private messages: Message[] = [];
  private sessionId: string;
  private config: WidgetConfig;
  private listEl: HTMLElement;
  private composerEl: HTMLTextAreaElement;
  private typingIndicator: HTMLElement;

  constructor(config: WidgetConfig = {}) {
    this.config = config;
    this.sessionId = this.restoreSession();
    this.root = this.buildUI();
    document.body.appendChild(this.root);
    this.listEl = this.root.querySelector('.nextctl-messages') as HTMLElement;
    this.composerEl = this.root.querySelector('.nextctl-input') as HTMLTextAreaElement;
    this.typingIndicator = this.root.querySelector('.nextctl-typing') as HTMLElement;
    this.registerEvents();
    this.connect();
  }

  private restoreSession() {
    const existing = localStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const session = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, session);
    document.cookie = `nextctl_session=${session}; path=/; max-age=31536000`;
    return session;
  }

  private buildUI() {
    const wrapper = createElement('div', 'nextctl-wrapper');
    wrapper.innerHTML = `
      <style>
        .nextctl-wrapper { position: fixed; bottom: 24px; right: 24px; z-index: 2147483647; font-family: 'Inter', system-ui, sans-serif; }
        .nextctl-card { width: 320px; background: #ffffff; border-radius: 16px; box-shadow: 0 20px 40px rgba(15, 23, 42, 0.25); overflow: hidden; display: none; flex-direction: column; }
        .nextctl-card.active { display: flex; }
        .nextctl-header { background: #2563EB; color: white; padding: 16px; }
        .nextctl-body { padding: 12px; height: 320px; overflow-y: auto; background: #F8FAFC; display: flex; flex-direction: column; gap: 8px; }
        .nextctl-message { padding: 8px 12px; border-radius: 12px; max-width: 80%; font-size: 14px; line-height: 1.4; }
        .nextctl-message.user { background: #2563EB; color: white; margin-left: auto; }
        .nextctl-message.admin { background: white; color: #1F2937; border: 1px solid #E2E8F0; margin-right: auto; }
        .nextctl-composer { border-top: 1px solid #E2E8F0; padding: 12px; background: white; }
        .nextctl-input { width: 100%; border: 1px solid #E2E8F0; border-radius: 12px; padding: 8px; resize: none; min-height: 48px; font-family: inherit; }
        .nextctl-toggle { width: 56px; height: 56px; border-radius: 999px; background: #2563EB; color: white; display: flex; align-items: center; justify-content: center; box-shadow: 0 12px 24px rgba(37, 99, 235, 0.35); cursor: pointer; }
        .nextctl-typing { font-size: 12px; color: #475569; padding: 0 12px 8px; display: none; }
        .nextctl-toggle svg { width: 28px; height: 28px; }
      </style>
      <div class="nextctl-card">
        <div class="nextctl-header">
          <div style="font-weight: 600; font-size: 16px;">${this.config.title ?? 'Chat with us'}</div>
          <div style="font-size: 13px; opacity: 0.85; margin-top: 4px;">${
            this.config.subtitle ?? 'Our team typically replies in under a minute.'
          }</div>
        </div>
        <div class="nextctl-body nextctl-messages"></div>
        <div class="nextctl-typing">Agent is typing…</div>
        <div class="nextctl-composer">
          <textarea class="nextctl-input" placeholder="Write a message" rows="3"></textarea>
        </div>
      </div>
      <div class="nextctl-toggle" aria-label="Open chat">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6A8.38 8.38 0 0 1 11.5 3h.5a8.5 8.5 0 0 1 9 8.5z" />
        </svg>
      </div>
    `;
    return wrapper;
  }

  private registerEvents() {
    const toggle = this.root.querySelector('.nextctl-toggle');
    const card = this.root.querySelector('.nextctl-card');

    toggle?.addEventListener('click', () => {
      card?.classList.toggle('active');
      if (card?.classList.contains('active')) {
        this.composerEl.focus();
        this.scrollToBottom();
      }
    });

    this.composerEl.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        this.sendMessage();
      }
    });

    let typingTimeout: number | undefined;
    this.composerEl.addEventListener('input', () => {
      if (!this.socket) return;
      this.socket.emit('typing', { typing: true });
      window.clearTimeout(typingTimeout);
      typingTimeout = window.setTimeout(() => {
        this.socket?.emit('typing', { typing: false });
      }, 1500);
    });
  }

  private connect() {
    this.socket = io(this.config.serverUrl ?? 'http://localhost:4000', {
      transports: ['websocket'],
      auth: { sessionId: this.sessionId },
    });

    this.socket.on('connect', () => {
      this.socket?.emit('session_joined', { sessionId: this.sessionId });
    });

    this.socket.on('session_assigned', ({ sessionId }: { sessionId: string }) => {
      this.sessionId = sessionId;
      localStorage.setItem(SESSION_KEY, sessionId);
      document.cookie = `nextctl_session=${sessionId}; path=/; max-age=31536000`;
    });

    this.socket.on('message', (message: Message) => {
      if (message.sessionId !== this.sessionId) return;
      this.messages.push(message);
      this.renderMessages();
      this.playNotification();
    });

    this.socket.on('typing', ({ userType, typing }: { userType: string; typing: boolean }) => {
      if (userType === 'admin') {
        this.typingIndicator.style.display = typing ? 'block' : 'none';
      }
    });

    this.fetchHistory();
  }

  private async fetchHistory() {
    try {
      const response = await fetch(
        `${this.config.serverUrl ?? 'http://localhost:4000'}/api/widget/messages/${this.sessionId}`
      );
      if (response.ok) {
        const data = (await response.json()) as Message[];
        this.messages = data;
        this.renderMessages();
      }
    } catch (error) {
      console.error('Failed to load history', error);
    }
  }

  private sendMessage() {
    const value = this.composerEl.value.trim();
    if (!value || !this.socket) return;
    this.socket.emit('message', { content: value });
    this.messages.push({
      _id: `${Date.now()}`,
      sessionId: this.sessionId,
      senderType: 'user',
      content: value,
      timestamp: new Date().toISOString(),
    });
    this.composerEl.value = '';
    this.renderMessages();
    this.socket.emit('typing', { typing: false });
  }

  private renderMessages() {
    this.listEl.innerHTML = '';
    this.messages.forEach((message) => {
      const bubble = createElement('div', `nextctl-message ${message.senderType}`);
      bubble.textContent = message.content;
      this.listEl.appendChild(bubble);
    });
    this.scrollToBottom();
  }

  private scrollToBottom() {
    this.listEl.scrollTop = this.listEl.scrollHeight;
  }

  private playNotification() {
    if (!('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification('New reply from support');
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }
}

(function init() {
  if (typeof window === 'undefined') return;
  const config = (window as any).NextCTLWidgetConfig as WidgetConfig | undefined;
  (window as any).NextCTLWidget = new NextCTLWidget(config);
})();
