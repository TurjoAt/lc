import { Box, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useEffect } from 'react';
import { Message } from '../pages/Dashboard';

dayjs.extend(relativeTime);

type Props = {
  messages: Message[];
  activeSessionId: string | null;
  typingUser: string | null;
};

const ChatWindow = ({ messages, activeSessionId, typingUser }: Props) => {
  useEffect(() => {
    const element = document.getElementById('chat-scroll-anchor');
    element?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, activeSessionId, typingUser]);

  if (!activeSessionId) {
    return (
      <Stack flex={1} alignItems="center" justifyContent="center">
        <Typography variant="h6" color="text.secondary">
          Select a conversation to get started
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack flex={1} spacing={2} p={3} sx={{ overflowY: 'auto', height: '100%' }}>
      {messages.map((message) => (
        <Stack
          key={message._id}
          direction="column"
          alignItems={message.senderType === 'admin' ? 'flex-end' : 'flex-start'}
        >
          <Box
            sx={{
              backgroundColor: message.senderType === 'admin' ? 'primary.main' : 'grey.200',
              color: message.senderType === 'admin' ? 'primary.contrastText' : 'text.primary',
              px: 2,
              py: 1,
              borderRadius: 2,
              maxWidth: '70%',
            }}
          >
            <Typography variant="body2">{message.content}</Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {dayjs(message.timestamp).format('HH:mm')} · {message.senderType.toUpperCase()}
          </Typography>
        </Stack>
      ))}
      {typingUser && (
        <Typography variant="body2" color="text.secondary">
          {typingUser} is typing…
        </Typography>
      )}
      <div id="chat-scroll-anchor" />
    </Stack>
  );
};

export default ChatWindow;
