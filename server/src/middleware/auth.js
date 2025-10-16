const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const Admin = require('../models/Admin');

const authMiddleware = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw createError(401, 'Authorization header missing');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw createError(401, 'Invalid authorization header format');
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(payload.id).lean();
    if (!admin) {
      throw createError(401, 'Admin not found');
    }

    req.admin = admin;
    next();
  } catch (error) {
    next(createError(error.status || 401, error.message || 'Unauthorized'));
  }
};

module.exports = authMiddleware;
