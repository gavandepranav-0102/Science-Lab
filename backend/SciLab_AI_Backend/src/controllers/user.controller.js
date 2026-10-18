import { readJson } from '../utils/jsonStore.js';
import { SESSIONS_FILE } from '../config/store.js';
import { sanitizeUser } from '../services/auth.service.js';

export async function profile(req, res) {
  res.json({ success: true, user: sanitizeUser(req.auth.user) });
}

export async function loginHistory(req, res) {
  const sessions = await readJson(SESSIONS_FILE);
  const items = sessions
    .filter(s => s.userId === req.auth.user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 50);
  res.json({ success: true, history: items });
}
