/**
 * OpenAI service placeholder.
 * Install: npm install openai
 * Configure OPENAI_API_KEY in .env
 */

export type OpenAIConfig = {
  apiKey: string;
  model?: string;
};

export function getOpenAIConfig(): OpenAIConfig | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  return {
    apiKey,
    model: "gpt-4o",
  };
}

export async function generateWithOpenAI(prompt: string): Promise<string> {
  void prompt;
  const config = getOpenAIConfig();
  if (!config) {
    throw new Error("OpenAI is not configured. Set OPENAI_API_KEY in .env");
  }

  // const OpenAI = (await import("openai")).default;
  // const client = new OpenAI({ apiKey: config.apiKey });
  // const response = await client.chat.completions.create({ ... });

  throw new Error(
    "OpenAI integration pending. Install the openai package to enable.",
  );
}
