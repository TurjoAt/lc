const Message = require('../models/Message');

exports.getConversation = async (req, res) => {
  const { sessionId } = req.params;
  const messages = await Message.find({ sessionId })
    .sort({ timestamp: 1 })
    .lean();
  res.json(messages);
};

exports.searchMessages = async (req, res) => {
  const { q } = req.query;
  const regex = new RegExp(q || '', 'i');
  const results = await Message.find({ content: regex })
    .limit(50)
    .lean();
  res.json(results);
};

exports.getConversationPublic = async (req, res) => {
  const { sessionId } = req.params;
  if (!sessionId) {
    return res.status(400).json({ message: 'sessionId is required' });
  }

  const messages = await Message.find({ sessionId })
    .sort({ timestamp: 1 })
    .lean();

  res.json(messages);
};
