import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY;

let ai: GoogleGenAI | null = null;

// Only initialize if key exists to prevent crashing the app on load
if (apiKey) {
  try {
    ai = new GoogleGenAI({ apiKey });
  } catch (error) {
    console.error("Error initializing Gemini client:", error);
  }
}

export const getSuggestionForLocation = async (location: string, timeOfDay: string): Promise<string> => {
  if (!ai) {
    return "💡 (未設定 API Key，無法使用 AI 建議功能)";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `I am in Melbourne, Australia at ${location} around ${timeOfDay}. 
      Give me one short, specific travel tip or a nearby hidden gem recommendation (under 30 words).`,
    });
    
    return response.text || "No suggestion available.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Could not fetch suggestion.";
  }
};