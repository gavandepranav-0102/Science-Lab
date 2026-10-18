import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'CHANGE_ME_IN_ENV',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieName: process.env.COOKIE_NAME || 'scilab_token',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  anthropicModel: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514'
};

if (env.nodeEnv === 'production' && env.jwtSecret === 'CHANGE_ME_IN_ENV') {
  throw new Error('JWT_SECRET must be changed in production.');
}
