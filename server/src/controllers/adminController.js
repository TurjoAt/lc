const bcrypt = require('bcryptjs');
const createError = require('http-errors');
const Admin = require('../models/Admin');

exports.listAdmins = async (_req, res) => {
  const admins = await Admin.find({}, '-passwordHash').lean();
  res.json(admins);
};

exports.createAdmin = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      throw createError(400, 'Name, email and password are required');
    }

    const exists = await Admin.findOne({ email }).lean();
    if (exists) {
      throw createError(409, 'Admin with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ name, email, passwordHash, role });

    res.status(201).json({
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateTheme = async (req, res, next) => {
  try {
    const { primaryColor, logoUrl } = req.body;
    const updated = await Admin.findByIdAndUpdate(
      req.admin._id,
      {
        theme: {
          primaryColor: primaryColor || req.admin.theme?.primaryColor,
          logoUrl: logoUrl || req.admin.theme?.logoUrl,
        },
      },
      { new: true }
    ).lean();

    res.json({
      id: updated._id,
      theme: updated.theme,
    });
  } catch (error) {
    next(error);
  }
};
