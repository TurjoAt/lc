/* eslint-disable no-console */
const log = (level, message, meta) => {
  const payload = {
    time: new Date().toISOString(),
    level,
    message,
    ...meta,
  };
  console.log(JSON.stringify(payload));
};

module.exports = {
  info: (message, meta) => log('info', message, meta),
  error: (message, meta) => log('error', message, meta),
};
