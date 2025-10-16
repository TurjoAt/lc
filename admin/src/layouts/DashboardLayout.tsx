import { AppBar, Avatar, Box, IconButton, Toolbar, Typography } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import React from 'react';
import { useAuth } from '../store/AuthContext';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { admin, logout } = useAuth();
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" elevation={1} color="default" sx={{ borderBottom: '1px solid #E5E7EB' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            NextCTL Live Chat
          </Typography>
          {admin && (
            <Box display="flex" alignItems="center" gap={1.5}>
              <Avatar>{admin.name.slice(0, 2).toUpperCase()}</Avatar>
              <Box>
                <Typography variant="subtitle2">{admin.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {admin.role}
                </Typography>
              </Box>
              <IconButton onClick={logout} color="inherit">
                <LogoutIcon />
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Box sx={{ display: 'flex', flexGrow: 1, minHeight: 0 }}>{children}</Box>
    </Box>
  );
};

export default DashboardLayout;
