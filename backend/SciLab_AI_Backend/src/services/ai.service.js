import { env } from '../config/env.js';

export async function chatWithAI({ messages, system }) {
  if (!env.anthropicApiKey) {
    return {
      provider: 'local',
      reply: 'AI backend is not configured yet. Add ANTHROPIC_API_KEY to the backend .env file.'
    };
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': env.anthropicApiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: env.anthropicModel,
      max_tokens: 1200,
      system,
      messages
    })
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data?.error?.message || `AI provider error ${response.status}`);
    error.status = 502;
    throw error;
  }

  const reply = data.content?.find(x => x.type === 'text')?.text || 'No response received.';
  return { provider: 'anthropic', reply, model: env.anthropicModel };
}
