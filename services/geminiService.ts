
import { GoogleGenAI, Type } from "@google/genai";

export interface WebsiteContent {
  title: string;
  description: string;
  category: string;
}

export async function generateWebsiteContent(prompt: string): Promise<WebsiteContent> {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Based on the following idea, generate a creative website title, a short description (1-2 sentences), and categorize it into one of the following: "Game", "Bike", or "Food". If it doesn't fit any of these, categorize it as "General". Idea: "${prompt}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "The creative and catchy title for the website.",
            },
            description: {
              type: Type.STRING,
              description: "A short, engaging description for the website (1-2 sentences).",
            },
            category: {
                type: Type.STRING,
                description: 'The category of the website idea. Must be one of: "Game", "Bike", "Food", or "General".'
            }
          },
          required: ["title", "description", "category"],
        },
      },
    });

    const jsonString = response.text.trim();
    const parsed = JSON.parse(jsonString);
    
    if (typeof parsed.title === 'string' && typeof parsed.description === 'string' && typeof parsed.category === 'string') {
        return parsed as WebsiteContent;
    } else {
        throw new Error("Invalid response format from Gemini API");
    }

  } catch (error) {
    console.error("Error generating website content:", error);
    throw new Error("Failed to generate content with AI. Please try again.");
  }
}
