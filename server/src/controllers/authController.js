const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const Admin = require('../models/Admin');

const generateToken = (admin) =>
  jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, {
    expiresIn: '12h',
  });

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw createError(400, 'Email and password are required');
    }

    const admin = await Admin.findOne({ email }).exec();
    if (!admin) {
      throw createError(401, 'Invalid credentials');
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      throw createError(401, 'Invalid credentials');
    }

    admin.online = true;
    admin.lastActiveAt = new Date();
    await admin.save();

    const token = generateToken(admin);
    res.json({
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        theme: admin.theme,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.me = async (req, res) => {
  const admin = await Admin.findById(req.admin._id).lean();
  res.json({
    id: admin._id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    theme: admin.theme,
    online: admin.online,
    lastActiveAt: admin.lastActiveAt,
  });
};

exports.logout = async (req, res, next) => {
  try {
    await Admin.findByIdAndUpdate(req.admin._id, { online: false });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
