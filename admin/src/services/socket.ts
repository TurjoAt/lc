import { io, Socket } from 'socket.io-client';

type AdminEvents = {
  message: (payload: any) => void;
};

let socket: Socket | null = null;

export const connectAdminSocket = (token: string) => {
  if (socket) {
    return socket;
  }

  socket = io(`${import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:4000'}/admin`, {
    auth: { token },
    autoConnect: true,
    transports: ['websocket'],
  });

  return socket;
};

export const getAdminSocket = () => socket;

export const disconnectAdminSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export type { AdminEvents };
