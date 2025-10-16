const UserSession = require('../models/UserSession');

exports.listSessions = async (_req, res) => {
  const sessions = await UserSession.find()
    .sort({ updatedAt: -1 })
    .lean();
  res.json(sessions);
};

exports.closeSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const session = await UserSession.findOneAndUpdate(
      { sessionId },
      { status: 'closed' },
      { new: true }
    ).lean();

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    next(error);
  }
};
