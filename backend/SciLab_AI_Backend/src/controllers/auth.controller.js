import { v4 as uuid } from 'uuid';
import { env } from '../config/env.js';
import { signToken } from '../utils/jwt.js';
import { isValidEmail, normalizeEmail, validatePassword, requiredString } from '../utils/validation.js';
import {
  createUser, findUserByEmail, verifyPassword, sanitizeUser,
  createSession, blacklistToken, updatePassword
} from '../services/auth.service.js';
import { readJson, writeJson } from '../utils/jsonStore.js';
import { USERS_FILE } from '../config/store.js';

const cookieOptions = {
  httpOnly: true,
  sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
  secure: env.nodeEnv === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/'
};

function setAuthCookie(res, token) {
  res.cookie(env.cookieName, token, cookieOptions);
}

function clearAuthCookie(res) {
  res.clearCookie(env.cookieName, {
    httpOnly: true,
    sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
    secure: env.nodeEnv === 'production',
    path: '/'
  });
}

function issueToken(user) {
  return signToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    jti: uuid()
  });
}

export async function register(req, res) {
  const name = requiredString(req.body.name, 'Name');
  const email = normalizeEmail(requiredString(req.body.email, 'Email'));
  const password = String(req.body.password || '');
  const institution = String(req.body.institution || '').trim();

  if (!isValidEmail(email)) return res.status(400).json({ success: false, message: 'Enter a valid email address.' });

  const passwordErrors = validatePassword(password);
  if (passwordErrors.length) return res.status(400).json({ success: false, message: passwordErrors[0], errors: passwordErrors });

  const user = await createUser({ name, email, institution, password });
  const token = issueToken(user);
  await createSession({ userId: user.id, tokenId: JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()).jti });

  setAuthCookie(res, token);
  res.status(201).json({ success: true, message: 'Account created successfully.', user });
}

export async function login(req, res) {
  const email = normalizeEmail(requiredString(req.body.email, 'Email'));
  const password = String(req.body.password || '');

  const user = await findUserByEmail(email);
  if (!user || !(await verifyPassword(user, password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const token = issueToken(user);
  const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
  await createSession({ userId: user.id, tokenId: payload.jti, type: 'login' });

  setAuthCookie(res, token);
  res.json({ success: true, message: `Welcome back, ${user.name.split(' ')[0]}!`, user: sanitizeUser(user) });
}

export async function guest(req, res) {
  const guest = {
    id: `guest-${uuid()}`,
    name: 'Guest',
    email: `guest-${uuid()}@scilab.local`,
    institution: '',
    role: 'guest',
    isGuest: true
  };
  const token = signToken({ sub: guest.id, email: guest.email, role: 'guest', jti: uuid(), guest: true });
  setAuthCookie(res, token);
  res.json({ success: true, user: guest });
}

export async function me(req, res) {
  res.json({ success: true, user: sanitizeUser(req.auth.user) });
}

export async function logout(req, res) {
  if (req.auth?.payload?.jti) await blacklistToken(req.auth.payload.jti);
  clearAuthCookie(res);
  res.json({ success: true, message: 'Logged out successfully.' });
}

export async function changePassword(req, res) {
  const current = String(req.body.currentPassword || '');
  const next = String(req.body.newPassword || '');
  const confirm = String(req.body.confirmPassword || '');

  if (!(await verifyPassword(req.auth.user, current))) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
  }
  const errors = validatePassword(next);
  if (errors.length) return res.status(400).json({ success: false, message: errors[0], errors });
  if (next !== confirm) return res.status(400).json({ success: false, message: 'Passwords do not match.' });

  await updatePassword(req.auth.user.id, next);
  await blacklistToken(req.auth.payload.jti);
  clearAuthCookie(res);
  res.json({ success: true, message: 'Password changed. Please sign in again.' });
}

export async function forgotPassword(req, res) {
  // Demo-safe flow: updates password only after validating account + new password.
  // Production should email a short-lived reset token.
  const email = normalizeEmail(requiredString(req.body.email, 'Email'));
  const newPassword = String(req.body.newPassword || '');
  const confirm = String(req.body.confirmPassword || '');

  const users = await readJson(USERS_FILE);
  const index = users.findIndex(u => u.email === email);
  if (index === -1) return res.status(404).json({ success: false, message: 'No account found with this email.' });

  const errors = validatePassword(newPassword);
  if (errors.length) return res.status(400).json({ success: false, message: errors[0], errors });
  if (newPassword !== confirm) return res.status(400).json({ success: false, message: 'Passwords do not match.' });

  const bcrypt = await import('bcryptjs');
  users[index].passwordHash = await bcrypt.default.hash(newPassword, 12);
  users[index].updatedAt = new Date().toISOString();
  await writeJson(USERS_FILE, users);

  res.json({ success: true, message: 'Password reset successfully.' });
}

export async function resetPassword(req, res) {
  return forgotPassword(req, res);
}
