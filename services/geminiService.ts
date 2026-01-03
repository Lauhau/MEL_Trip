import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSuggestionForLocation = async (location: string, timeOfDay: string): Promise<string> => {
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