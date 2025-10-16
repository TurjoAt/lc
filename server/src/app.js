const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const createError = require('http-errors');

const authRoutes = require('./routes/auth');
const sessionRoutes = require('./routes/sessions');
const messageRoutes = require('./routes/messages');
const adminRoutes = require('./routes/admins');
const widgetRoutes = require('./routes/widget');

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: process.env.ADMIN_UI_ORIGIN?.split(',') || '*', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(morgan('dev'));

const publicLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

app.use('/api/auth', publicLimiter, authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/widget', widgetRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use((_req, _res, next) => {
  next(createError(404, 'Resource not found'));
});

app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Unexpected error',
    status,
  });
});

module.exports = app;
