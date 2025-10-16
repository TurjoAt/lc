import { IconButton, Paper, Stack, TextField } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { FormEvent, useState } from 'react';

type Props = {
  onSend: (message: string) => void;
  disabled?: boolean;
  onTyping?: (typing: boolean) => void;
};

const ChatComposer = ({ onSend, disabled, onTyping }: Props) => {
  const [value, setValue] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!value.trim()) return;
    onSend(value.trim());
    setValue('');
    onTyping?.(false);
  };

  return (
    <Paper component="form" onSubmit={handleSubmit} elevation={3} sx={{ p: 1.5 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField
          value={value}
          placeholder="Type a reply"
          fullWidth
          multiline
          maxRows={4}
          disabled={disabled}
          onChange={(event) => {
            setValue(event.target.value);
            onTyping?.(true);
          }}
        />
        <IconButton type="submit" color="primary" disabled={disabled || !value.trim()}>
          <SendIcon />
        </IconButton>
      </Stack>
    </Paper>
  );
};

export default ChatComposer;
