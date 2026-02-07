import dotenv from 'dotenv';

dotenv.config();

export const config = {
  database: {
    url: process.env.DATABASE_URL!,
  },
  redis: {
    url: process.env.REDIS_URL!,
  },
  smtp: {
    host: process.env.SMTP_HOST!,
    port: parseInt(process.env.SMTP_PORT!),
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
  app: {
    port: parseInt(process.env.PORT || '3001'),
    env: process.env.NODE_ENV || 'development',
  },
  rateLimit: {
    maxEmailsPerHour: parseInt(process.env.MAX_EMAILS_PER_HOUR || '100'),
    minDelayBetweenSends: parseInt(process.env.MIN_DELAY_BETWEEN_SENDS || '1000'),
  },
};
