/**
 * Google Gemini service placeholder.
 * Install: npm install @google/generative-ai
 * Configure GEMINI_API_KEY in .env
 */

export type GeminiConfig = {
  apiKey: string;
  model?: string;
};

export function getGeminiConfig(): GeminiConfig | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  return {
    apiKey,
    model: "gemini-2.0-flash",
  };
}

export async function generateWithGemini(prompt: string): Promise<string> {
  void prompt;
  const config = getGeminiConfig();
  if (!config) {
    throw new Error("Gemini is not configured. Set GEMINI_API_KEY in .env");
  }

  throw new Error(
    "Gemini integration pending. Install @google/generative-ai to enable.",
  );
}
