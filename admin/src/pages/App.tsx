import { CircularProgress, Stack } from '@mui/material';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import LoginPage from './Login';
import DashboardPage from './Dashboard';

const App = () => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <Stack alignItems="center" justifyContent="center" height="100vh">
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={token ? <DashboardPage /> : <Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
