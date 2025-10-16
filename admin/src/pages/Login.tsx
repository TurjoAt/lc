import { Lock } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Invalid credentials or server unavailable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack minHeight="100vh" alignItems="center" justifyContent="center" sx={{ background: '#111827' }}>
      <Card sx={{ minWidth: 360, boxShadow: 4 }}>
        <CardContent>
          <Stack spacing={2} component="form" onSubmit={handleSubmit}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Lock color="primary" />
              <Typography variant="h5">NextCTL Admin</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Sign in to manage live conversations in real time.
            </Typography>
            <TextField
              label="Email"
              value={email}
              type="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              fullWidth
            />
            {error && (
              <Box sx={{ color: 'error.main', fontSize: 14 }}>
                {error}
              </Box>
            )}
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default LoginPage;
