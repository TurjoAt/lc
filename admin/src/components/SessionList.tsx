import { Avatar, Badge, List, ListItemButton, ListItemText, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export type Session = {
  _id: string;
  sessionId: string;
  status: 'active' | 'closed';
  lastMessageAt?: string;
  updatedAt?: string;
};

type Props = {
  sessions: Session[];
  activeSessionId: string | null;
  onSelect: (sessionId: string) => void;
};

const SessionList = ({ sessions, activeSessionId, onSelect }: Props) => (
  <Stack sx={{ width: 320, borderRight: '1px solid #E5E7EB', height: '100%' }}>
    <Stack direction="row" alignItems="center" justifyContent="space-between" p={2}>
      <Typography variant="h6">Active sessions</Typography>
      <Badge color="primary" badgeContent={sessions.length} />
    </Stack>
    <List sx={{ overflowY: 'auto', flexGrow: 1 }}>
      {sessions.map((session) => (
        <ListItemButton
          key={session.sessionId}
          selected={activeSessionId === session.sessionId}
          onClick={() => onSelect(session.sessionId)}
        >
          <Avatar sx={{ mr: 2 }}>{session.sessionId.slice(0, 2).toUpperCase()}</Avatar>
          <ListItemText
            primary={`Visitor ${session.sessionId.slice(0, 6)}`}
            secondary={
              session.lastMessageAt || session.updatedAt
                ? `Last activity ${dayjs(session.lastMessageAt || session.updatedAt).fromNow()}`
                : 'New conversation'
            }
          />
        </ListItemButton>
      ))}
    </List>
  </Stack>
);

export default SessionList;
