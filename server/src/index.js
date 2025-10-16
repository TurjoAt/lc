require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/db');
const buildSocketServer = require('./socket');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    const server = http.createServer(app);
    buildSocketServer(server);

    server.listen(PORT, () => {
      logger.info(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to bootstrap server', { error: error.message });
    process.exit(1);
  }
})();
