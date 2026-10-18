import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = path.resolve(__dirname, '../../data');

export const USERS_FILE = path.join(DATA_DIR, 'users.json');
export const HISTORY_FILE = path.join(DATA_DIR, 'history.json');
export const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
export const BLACKLIST_FILE = path.join(DATA_DIR, 'blacklist.json');
