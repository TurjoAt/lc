import { useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { connectAdminSocket, disconnectAdminSocket, getAdminSocket } from '../services/socket';
import { useAuth } from '../store/AuthContext';

type Handler = (socket: Socket) => void;

export const useAdminSocket = (handler: Handler) => {
  const { token } = useAuth();

  useEffect(() => {
    if (!token) {
      disconnectAdminSocket();
      return;
    }

    const socket = connectAdminSocket(token);
    handler(socket);

    return () => {
      socket.removeAllListeners();
    };
  }, [token, handler]);

  return getAdminSocket();
};
