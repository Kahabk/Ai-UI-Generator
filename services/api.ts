
import { GoogleGenAI, Type } from "@google/genai";
import { LandingPageConfig } from "../types";

const API_URL = "https://743c07e838d1.ngrok-free.app";

/**
 * Fallback generator using Gemini 3 Flash when the ngrok tunnel is unavailable.
 * Mimics the user's backend response structure exactly.
 */
async function generateWithGemini(prompt: string): Promise<LandingPageConfig> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const systemInstruction = `
    You are a UI/UX design agent named Kahab. 
    You must return a JSON object exactly matching the schema.
    Logic:
    1. Determine intent (industry, tone, mode).
    2. Plan sections: ["hero", "credibility", "services", "workflow", "case_studies", "cta"].
    3. Generate premium copy for each section based on the industry/tone.
    4. For the 'case_studies' section, populate the 'examples' object with 2-3 key-value pairs where the value is a description of a project.
    5. Provide image URLs using https://picsum.photos/1400/900?random={N}.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          meta: {
            type: Type.OBJECT,
            properties: {
              engine: { type: Type.STRING },
              brand: { type: Type.STRING },
              hash: { type: Type.STRING }
            },
            required: ["engine", "hash"]
          },
          intent: {
            type: Type.OBJECT,
            properties: {
              industry: { type: Type.STRING },
              tone: { type: Type.STRING },
              mode: { type: Type.STRING, enum: ["dark", "light"] },
              wants_trust: { type: Type.BOOLEAN },
              wants_case_studies: { type: Type.BOOLEAN }
            },
            required: ["industry", "tone", "mode", "wants_trust", "wants_case_studies"]
          },
          theme: {
            type: Type.OBJECT,
            properties: {
              mode: { type: Type.STRING },
              colors: {
                type: Type.OBJECT,
                properties: {
                  primary: { type: Type.STRING },
                  background: { type: Type.STRING },
                  text: { type: Type.STRING }
                },
                required: ["primary", "background", "text"]
              }
            },
            required: ["mode", "colors"]
          },
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                content: {
                  type: Type.OBJECT,
                  properties: {
                    headline: { type: Type.STRING },
                    subtext: { type: Type.STRING },
                    text: { type: Type.STRING },
                    button: { type: Type.STRING }
                  }
                },
                image: { type: Type.STRING },
                images: { type: Type.ARRAY, items: { type: Type.STRING } },
                stats: { type: Type.ARRAY, items: { type: Type.STRING } },
                items: { type: Type.ARRAY, items: { type: Type.STRING } },
                steps: { type: Type.ARRAY, items: { type: Type.STRING } },
                examples: { 
                  type: Type.OBJECT,
                  properties: {
                    project_1: { type: Type.STRING },
                    project_2: { type: Type.STRING }
                  },
                  description: "Key-value pairs representing case study examples."
                }
              },
              required: ["type"]
            }
          }
        },
        required: ["meta", "intent", "theme", "sections"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text);
    data.meta.engine = "gemini-3-flash-fallback";
    return data as LandingPageConfig;
  } catch (e) {
    console.error("Gemini parse error:", e);
    throw e;
  }
}

export async function generateLandingPage(prompt: string): Promise<LandingPageConfig> {
  console.log(`Sending prompt to Kahab Engine (${API_URL}):`, prompt);
  
  try {
    const response = await fetch(`${API_URL}/generate-landing-page`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Backend API Error (${response.status}):`, errorBody);
      throw new Error(`Local backend error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.warn("Target API unreachable. Invoking Gemini Resiliency Fallback.", error);
    return await generateWithGemini(prompt);
  }
}
