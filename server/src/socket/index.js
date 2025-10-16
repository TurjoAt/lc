const { Server } = require('socket.io');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const { v4: uuid } = require('uuid');

const UserSession = require('../models/UserSession');
const Message = require('../models/Message');
const Admin = require('../models/Admin');
const logger = require('../utils/logger');

const parseSessionId = (socket) => {
  const cookies = cookie.parse(socket.handshake.headers?.cookie || '');
  return socket.handshake.auth?.sessionId || cookies['nextctl_session'];
};

const persistMessage = async ({ sessionId, senderType, senderId, content }) => {
  const message = await Message.create({
    sessionId,
    senderType,
    senderId,
    content,
  });

  await UserSession.findOneAndUpdate(
    { sessionId },
    { lastMessageAt: new Date() },
    { new: true }
  );

  return message;
};

const buildSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.SOCKET_ALLOWED_ORIGINS?.split(',') || '*',
      credentials: true,
    },
  });

  const adminNamespace = io.of('/admin');

  adminNamespace.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        throw new Error('Missing token');
      }

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const admin = await Admin.findById(payload.id);
      if (!admin) {
        throw new Error('Admin not found');
      }

      socket.data.admin = admin;
      await Admin.findByIdAndUpdate(admin._id, { online: true, lastActiveAt: new Date() });
      next();
    } catch (error) {
      next(error);
    }
  });

  adminNamespace.on('connection', (socket) => {
    const admin = socket.data.admin;
    logger.info('Admin connected', { admin: admin.email });

    socket.emit('admin_ready', {
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });

    socket.on('disconnect', async () => {
      await Admin.findByIdAndUpdate(admin._id, { online: false, lastActiveAt: new Date() });
      logger.info('Admin disconnected', { admin: admin.email });
    });

    socket.on('join_session', async ({ sessionId }) => {
      if (!sessionId) return;
      socket.join(sessionId);
      socket.emit('session_joined', { sessionId });
    });

    socket.on('admin_message', async ({ sessionId, content }) => {
      if (!sessionId || !content) return;
      const message = await persistMessage({
        sessionId,
        senderType: 'admin',
        senderId: String(admin._id),
        content,
      });

      io.to(sessionId).emit('message', message);
      adminNamespace.emit('message', message);
    });

    socket.on('typing', ({ sessionId, typing }) => {
      if (!sessionId) return;
      io.to(sessionId).emit('typing', { sessionId, userType: 'admin', typing });
    });

    socket.on('mark_seen', async ({ sessionId }) => {
      if (!sessionId) return;
      await Message.updateMany({ sessionId, senderType: 'user', seen: false }, { seen: true });
      io.to(sessionId).emit('seen', { sessionId });
    });
  });

  io.on('connection', async (socket) => {
    let sessionId = parseSessionId(socket);

    if (!sessionId) {
      sessionId = uuid();
      socket.emit('session_assigned', { sessionId });
    }

    socket.join(sessionId);

    const session = await UserSession.findOneAndUpdate(
      { sessionId },
      {
        sessionId,
        socketId: socket.id,
        status: 'active',
        metadata: {
          userAgent: socket.handshake.headers['user-agent'],
          ipAddress: socket.handshake.address,
          referrer: socket.handshake.headers.referer,
        },
      },
      { upsert: true, new: true }
    );

    logger.info('User connected', { sessionId: session.sessionId });

    socket.emit('session_joined', { sessionId: session.sessionId });
    adminNamespace.emit('session_joined', session);

    socket.on('message', async ({ content }) => {
      if (!content) return;
      const message = await persistMessage({
        sessionId,
        senderType: 'user',
        senderId: sessionId,
        content,
      });

      io.to(sessionId).emit('message', message);
      adminNamespace.emit('message', {
        ...message.toObject?.() || message,
        notification: true,
      });
    });

    socket.on('typing', ({ typing }) => {
      socket.to(sessionId).emit('typing', { sessionId, userType: 'user', typing });
      adminNamespace.emit('typing', { sessionId, userType: 'user', typing });
    });

    socket.on('disconnect', async () => {
      await UserSession.findOneAndUpdate({ sessionId }, { status: 'closed' });
      adminNamespace.emit('session_closed', { sessionId });
      logger.info('User disconnected', { sessionId });
    });
  });

  return io;
};

module.exports = buildSocketServer;
