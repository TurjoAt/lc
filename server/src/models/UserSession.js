const mongoose = require('mongoose');

const userSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    socketId: { type: String },
    status: { type: String, enum: ['active', 'closed'], default: 'active' },
    metadata: {
      userAgent: String,
      ipAddress: String,
      referrer: String,
    },
    lastMessageAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserSession', userSessionSchema);
