import fs from 'node:fs/promises';
import path from 'node:path';

const queue = new Map();

async function ensure(file) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  try {
    await fs.access(file);
  } catch {
    await fs.writeFile(file, '[]', 'utf8');
  }
}

export async function readJson(file) {
  await ensure(file);
  const raw = await fs.readFile(file, 'utf8');
  try {
    return JSON.parse(raw || '[]');
  } catch {
    throw new Error(`Invalid JSON data file: ${file}`);
  }
}

export async function writeJson(file, data) {
  const previous = queue.get(file) || Promise.resolve();
  const next = previous.then(async () => {
    await ensure(file);
    const tmp = `${file}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8');
    await fs.rename(tmp, file);
  });
  queue.set(file, next.catch(() => {}));
  return next;
}
