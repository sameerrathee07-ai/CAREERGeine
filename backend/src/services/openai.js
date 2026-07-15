import OpenAI from 'openai';
import logger from './logger.js';

const RETRIES = 2;
const TIMEOUT = 30000;

let client = null;

function getClient() {
  if (client) return client;
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  client = new OpenAI({ apiKey: key, timeout: TIMEOUT, maxRetries: 0 });
  return client;
}

export function isAiConfigured() {
  return !!process.env.OPENAI_API_KEY;
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function extractText(response) {
  if (response.output?.[0]?.type === 'message') {
    return response.output[0].content?.[0]?.text || '';
  }
  if (response.choices?.[0]?.message?.content) {
    return response.choices[0].message.content;
  }
  return '';
}

function parseJson(text) {
  const cleaned = text.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON object found in response');
  return JSON.parse(cleaned.slice(start, end + 1));
}

export async function aiCall({ system, user, schema, temperature = 0.1, maxTokens = 2000 }) {
  const ai = getClient();
  if (!ai) {
    logger.warn('AI call skipped: OPENAI_API_KEY not configured');
    return null;
  }

  const messages = [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];

  let lastError = null;

  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    if (attempt > 0) await sleep(Math.pow(2, attempt) * 1000);

    try {
      // Primary: Responses API
      const body = {
        model: process.env.OPENAI_MODEL || 'gpt-4o',
        input: messages,
        temperature,
        max_output_tokens: maxTokens,
        ...(schema
          ? { text: { format: { type: 'json_schema', schema } } }
          : { text: { format: { type: 'json_object' } } }),
      };

      const response = await ai.responses.create(body);
      const text = extractText(response);

      if (!text) throw new Error('Empty AI response');

      if (schema || body.text.format.type === 'json_object') {
        return { data: parseJson(text), usage: response.usage || null };
      }

      return { data: text, usage: response.usage || null };
    } catch (err1) {
      // Fallback: Chat Completions API
      try {
        const body = {
          model: process.env.OPENAI_MODEL || 'gpt-4o',
          messages,
          temperature,
          max_tokens: maxTokens,
          ...(schema
            ? { response_format: { type: 'json_schema', json_schema: { schema, name: 'response' } } }
            : { response_format: { type: 'json_object' } }),
        };

        const response = await ai.chat.completions.create(body);
        const text = response.choices?.[0]?.message?.content || '';

        if (!text) throw new Error('Empty AI response');

        if (schema || body.response_format?.type === 'json_object') {
          return { data: parseJson(text), usage: response.usage || null };
        }

        return { data: text, usage: response.usage || null };
      } catch (err2) {
        lastError = err2;
        logger.warn(`AI call attempt ${attempt + 1} failed: ${err2.message}`);
      }
    }
  }

  logger.error(`AI call failed after ${RETRIES + 1} attempts: ${lastError?.message}`);
  return null;
}
