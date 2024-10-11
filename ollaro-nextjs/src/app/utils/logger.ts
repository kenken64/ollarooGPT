import pino from 'pino';

const logger = pino({
  transport: {
    target: 'pino-pretty', // This is for development use, to make the logs readable
    options: {
      colorize: true,
    },
  },
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
});

export default logger;