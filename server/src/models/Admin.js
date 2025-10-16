const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['agent', 'superadmin'], default: 'agent' },
    online: { type: Boolean, default: false },
    lastActiveAt: { type: Date },
    theme: {
      primaryColor: { type: String, default: '#1F2937' },
      logoUrl: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Admin', adminSchema);
