import { Alert, Box, Divider, Snackbar, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Socket } from 'socket.io-client';
import api from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import SessionList, { Session } from '../components/SessionList';
import ChatWindow from '../components/ChatWindow';
import ChatComposer from '../components/ChatComposer';
import { useAdminSocket } from '../hooks/useAdminSocket';

export type Message = {
  _id: string;
  sessionId: string;
  senderType: 'user' | 'admin';
  senderId?: string;
  content: string;
  timestamp: string;
  seen: boolean;
};

dayjs.extend(relativeTime);

type TypingState = {
  sessionId: string;
  userType: 'user' | 'admin';
  typing?: boolean;
};

const DashboardPage = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState<TypingState | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const sortedSessions = useMemo(
    () =>
      [...sessions].sort((a, b) => {
        const right = dayjs(b.lastMessageAt || b.updatedAt || 0).valueOf();
        const left = dayjs(a.lastMessageAt || a.updatedAt || 0).valueOf();
        return right - left;
      }),
    [sessions]
  );

  const loadSessions = useCallback(async () => {
    const { data } = await api.get<Session[]>('/sessions');
    setSessions(data);
  }, []);

  const loadMessages = useCallback(async (sessionId: string) => {
    const { data } = await api.get<Message[]>(`/messages/${sessionId}`);
    setMessages(data);
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleSocketSetup = useCallback(
    (socket: Socket) => {
      socket.on('session_joined', (session: Session) => {
        setSessions((prev) => {
          const exists = prev.find((s) => s.sessionId === session.sessionId);
          if (exists) {
            return prev.map((s) => (s.sessionId === session.sessionId ? { ...s, ...session } : s));
          }
          return [session, ...prev];
        });
      });

      socket.on('session_closed', ({ sessionId }: { sessionId: string }) => {
        setSessions((prev) =>
          prev.map((session) => (session.sessionId === sessionId ? { ...session, status: 'closed' } : session))
        );
      });

      socket.on('message', (message: Message & { notification?: boolean }) => {
        setSessions((prev) =>
          prev.map((session) =>
            session.sessionId === message.sessionId
              ? { ...session, lastMessageAt: message.timestamp, status: 'active' }
              : session
          )
        );

        if (selectedSession === message.sessionId) {
          setMessages((prev) => [...prev, message]);
        }

        if (message.notification && selectedSession !== message.sessionId) {
          setNotification('New message from visitor ' + message.sessionId.slice(0, 6));
        }
      });

      socket.on('typing', (payload: TypingState) => {
        setTyping(payload);
      });
    },
    [selectedSession]
  );

  const socket = useAdminSocket(handleSocketSetup);

  const handleSelectSession = async (sessionId: string) => {
    setSelectedSession(sessionId);
    await loadMessages(sessionId);
    socket?.emit('join_session', { sessionId });
    socket?.emit('mark_seen', { sessionId });
  };

  const handleSendMessage = (content: string) => {
    if (!selectedSession) return;
    socket?.emit('admin_message', { sessionId: selectedSession, content });
    const optimistic: Message = {
      _id: `${Date.now()}`,
      sessionId: selectedSession,
      senderType: 'admin',
      senderId: 'me',
      content,
      timestamp: new Date().toISOString(),
      seen: true,
    };
    setMessages((prev) => [...prev, optimistic]);
  };

  const handleTyping = (isTyping: boolean) => {
    if (!selectedSession) return;
    socket?.emit('typing', { sessionId: selectedSession, typing: isTyping });
  };

  return (
    <DashboardLayout>
      <SessionList sessions={sortedSessions} activeSessionId={selectedSession} onSelect={handleSelectSession} />
      <Divider orientation="vertical" flexItem />
      <Stack flex={1} spacing={0} sx={{ minWidth: 0 }}>
        <Box p={2} borderBottom="1px solid #E5E7EB">
          <Typography variant="h6">
            {selectedSession ? `Visitor ${selectedSession.slice(0, 6)}` : 'No session selected'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {selectedSession ? 'Real-time conversation' : 'Pick a user from the left to view messages'}
          </Typography>
        </Box>
        <ChatWindow
          messages={messages}
          activeSessionId={selectedSession}
          typingUser={
            typing && typing.sessionId === selectedSession && typing.userType === 'user' && typing.typing
              ? 'Visitor'
              : null
          }
        />
        <Box p={2} borderTop="1px solid #E5E7EB">
          <ChatComposer onSend={handleSendMessage} disabled={!selectedSession} onTyping={handleTyping} />
        </Box>
      </Stack>
      <Snackbar
        open={!!notification}
        autoHideDuration={4000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="info" variant="filled" sx={{ width: '100%' }}>
          {notification}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
};

export default DashboardPage;
