import { GoogleGenAI } from '@google/genai';
import type { Config } from '../config';

export interface MapsResult {
  text: string;
  chunks: Array<Record<string, any>>;
  queries: string[];
}

/** Thin seam over the Gemini SDK so routes/tests never depend on the network. */
export interface AiClient {
  generateJson(req: { system?: string; prompt: string }): Promise<unknown>;
  searchMaps(req: { prompt: string; latLng?: { latitude: number; longitude: number } }): Promise<MapsResult>;
}

const TIMEOUT_MS = 15_000;

function withTimeout<T>(p: Promise<T>, ms = TIMEOUT_MS): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Gemini request timed out after ${ms}ms`)), ms);
  });
  return Promise.race([p, timeout]).finally(() => clearTimeout(timer));
}

export function parseJsonLoose(text: string): unknown {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  return JSON.parse(cleaned);
}

export function createAiClient(config: Pick<Config, 'GEMINI_API_KEY' | 'GEMINI_MODEL'>): AiClient | null {
  if (!config.GEMINI_API_KEY) return null;
  const genai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
  const model = config.GEMINI_MODEL;
  return {
    async generateJson({ system, prompt }) {
      const res = await withTimeout(
        genai.models.generateContent({
          model,
          contents: prompt,
          config: { systemInstruction: system, responseMimeType: 'application/json' }
        })
      );
      if (!res.text) throw new Error('Empty response from Gemini');
      return parseJsonLoose(res.text);
    },
    async searchMaps({ prompt, latLng }) {
      // responseMimeType/responseSchema must NOT be set together with the googleMaps tool.
      const res = await withTimeout(
        genai.models.generateContent({
          model,
          contents: prompt,
          config: {
            tools: [{ googleMaps: {} }],
            ...(latLng ? { toolConfig: { retrievalConfig: { latLng } } } : {})
          }
        }),
        25_000
      );
      const meta = res.candidates?.[0]?.groundingMetadata;
      return {
        text: res.text ?? '',
        chunks: (meta?.groundingChunks as Array<Record<string, any>>) ?? [],
        queries: meta?.webSearchQueries ?? []
      };
    }
  };
}
