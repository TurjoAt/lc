const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sessionId: { type: String, index: true, required: true },
    senderType: { type: String, enum: ['user', 'admin'], required: true },
    senderId: { type: String },
    content: { type: String, required: true },
    attachments: [
      {
        url: String,
        name: String,
        type: String,
      },
    ],
    seen: { type: Boolean, default: false },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: { createdAt: 'timestamp', updatedAt: false } }
);

module.exports = mongoose.model('Message', messageSchema);
