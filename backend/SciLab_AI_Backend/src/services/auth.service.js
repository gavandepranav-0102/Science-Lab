import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { USERS_FILE, SESSIONS_FILE, BLACKLIST_FILE } from '../config/store.js';
import { readJson, writeJson } from '../utils/jsonStore.js';
import { normalizeEmail } from '../utils/validation.js';

export async function findUserByEmail(email) {
  const users = await readJson(USERS_FILE);
  return users.find(u => u.email === normalizeEmail(email)) || null;
}

export async function findUserById(id) {
  const users = await readJson(USERS_FILE);
  return users.find(u => u.id === id) || null;
}

export async function createUser({ name, email, institution, password }) {
  const users = await readJson(USERS_FILE);
  const normalized = normalizeEmail(email);

  if (users.some(u => u.email === normalized)) {
    const error = new Error('An account with this email already exists.');
    error.status = 409;
    throw error;
  }

  const user = {
    id: uuid(),
    name,
    email: normalized,
    institution: institution || '',
    passwordHash: await bcrypt.hash(password, 12),
    role: 'student',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  users.push(user);
  await writeJson(USERS_FILE, users);
  return sanitizeUser(user);
}

export async function verifyPassword(user, password) {
  return bcrypt.compare(password, user.passwordHash);
}

export function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

export async function updatePassword(userId, newPassword) {
  const users = await readJson(USERS_FILE);
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) {
    const error = new Error('User not found.');
    error.status = 404;
    throw error;
  }
  users[index].passwordHash = await bcrypt.hash(newPassword, 12);
  users[index].updatedAt = new Date().toISOString();
  await writeJson(USERS_FILE, users);
}

export async function createSession({ userId, tokenId, type = 'login' }) {
  const sessions = await readJson(SESSIONS_FILE);
  sessions.push({
    id: uuid(),
    userId,
    tokenId,
    type,
    createdAt: new Date().toISOString()
  });
  await writeJson(SESSIONS_FILE, sessions);
}

export async function blacklistToken(tokenId) {
  const blacklist = await readJson(BLACKLIST_FILE);
  if (!blacklist.some(x => x.tokenId === tokenId)) {
    blacklist.push({ tokenId, blacklistedAt: new Date().toISOString() });
    await writeJson(BLACKLIST_FILE, blacklist);
  }
}

export async function isBlacklisted(tokenId) {
  const blacklist = await readJson(BLACKLIST_FILE);
  return blacklist.some(x => x.tokenId === tokenId);
}
