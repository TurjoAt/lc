import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import App from './pages/App';
import { AuthProvider } from './store/AuthContext';
import './styles/global.css';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563EB',
    },
    background: {
      default: '#F3F4F6',
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
