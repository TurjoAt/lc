import cors from 'cors';
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { fetchAIResponse } from './aiAdapter.js';

const app = express();
const server = http.createServer(app);

const widgetOrigin = process.env.WIDGET_ORIGIN || 'http://localhost:3000';

app.use(
  cors({
    origin: widgetOrigin,
    credentials: true,
  })
);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const io = new SocketIOServer(server, {
  cors: {
    origin: widgetOrigin,
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });

  socket.on('client_message', async (payload) => {
    try {
      console.log('Received client message:', payload);
      const aiResponse = await fetchAIResponse(payload?.message ?? '');
      socket.emit('ai_response', aiResponse);
    } catch (error) {
      console.error('Error handling client message:', error);
      socket.emit('ai_error', { message: 'Failed to fetch AI response.' });
    }
  });
});

const port = Number(process.env.PORT) || 4000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  console.log(`CORS enabled for origin: ${widgetOrigin}`);
});
