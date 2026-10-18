import { verifyToken } from '../utils/jwt.js';
import { env } from '../config/env.js';
import { findUserById, isBlacklisted } from '../services/auth.service.js';

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.[env.cookieName] ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : null);

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const payload = verifyToken(token);

    if (await isBlacklisted(payload.jti)) {
      return res.status(401).json({ success: false, message: 'Session is no longer valid.' });
    }

    const user = await findUserById(payload.sub);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User account not found.' });
    }

    req.auth = { user, token, payload };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session.' });
  }
}
