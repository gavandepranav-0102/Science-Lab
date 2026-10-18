import { chatWithAI } from '../services/ai.service.js';

export async function chat(req, res) {
  const { messages = [], context = {} } = req.body;

  if (!Array.isArray(messages) || !messages.length) {
    return res.status(400).json({ success: false, message: 'messages must be a non-empty array.' });
  }

  const safeMessages = messages.slice(-12).map(m => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: String(m.content || '').slice(0, 8000)
  }));

  const system = `You are SciLab AI, an educational virtual science laboratory assistant.
Help students understand Chemistry and Physics experiments, procedures, equations,
observations, calculations, safety, viva questions, and what-if scenarios.
Do not claim a simulation result is real-world experimental data.
Current context:
Subject: ${context.subject || 'unknown'}
Experiment: ${context.experimentName || context.experimentKey || 'unknown'}
Status: ${context.status || 'idle'}
pH: ${context.ph ?? 'n/a'}
Temperature: ${context.temperature ?? 'n/a'}
Volume: ${context.volume ?? 'n/a'}
`;

  const result = await chatWithAI({ messages: safeMessages, system });
  res.json({ success: true, ...result });
}
