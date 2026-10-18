import { v4 as uuid } from 'uuid';
import { HISTORY_FILE } from '../config/store.js';
import { readJson, writeJson } from '../utils/jsonStore.js';

export async function listHistory(req, res) {
  const history = await readJson(HISTORY_FILE);
  const items = history
    .filter(x => x.userId === req.auth.user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json({ success: true, history: items });
}

export async function getHistoryItem(req, res) {
  const history = await readJson(HISTORY_FILE);
  const item = history.find(x => x.id === req.params.id && x.userId === req.auth.user.id);
  if (!item) return res.status(404).json({ success: false, message: 'Experiment record not found.' });
  res.json({ success: true, experiment: item });
}

export async function saveExperiment(req, res) {
  const {
    subject = 'chemistry',
    experimentKey,
    experimentName,
    score = 0,
    status = 'completed',
    observations = [],
    parameters = {},
    result = {},
    chat = []
  } = req.body;

  if (!experimentKey || !experimentName) {
    return res.status(400).json({ success: false, message: 'experimentKey and experimentName are required.' });
  }

  const history = await readJson(HISTORY_FILE);
  const item = {
    id: uuid(),
    userId: req.auth.user.id,
    subject,
    experimentKey,
    experimentName,
    score: Number(score) || 0,
    status,
    observations,
    parameters,
    result,
    chat: Array.isArray(chat) ? chat.slice(-30) : [],
    createdAt: new Date().toISOString()
  };

  history.push(item);
  await writeJson(HISTORY_FILE, history);
  res.status(201).json({ success: true, message: 'Experiment saved.', experiment: item });
}

export async function deleteHistoryItem(req, res) {
  const history = await readJson(HISTORY_FILE);
  const next = history.filter(x => !(x.id === req.params.id && x.userId === req.auth.user.id));
  if (next.length === history.length) {
    return res.status(404).json({ success: false, message: 'Experiment record not found.' });
  }
  await writeJson(HISTORY_FILE, next);
  res.json({ success: true, message: 'Experiment deleted.' });
}

export async function clearHistory(req, res) {
  const history = await readJson(HISTORY_FILE);
  const next = history.filter(x => x.userId !== req.auth.user.id);
  await writeJson(HISTORY_FILE, next);
  res.json({ success: true, message: 'Experiment history cleared.' });
}
