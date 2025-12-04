
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const getInspirationalQuote = async (): Promise<string> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "짧고 영감을 주는 인용구를 하나 알려줘.",
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching inspirational quote:", error);
    return "영감을 주는 말을 가져오는 데 실패했습니다. 잠시 후 다시 시도해주세요.";
  }
};

export const getNewsSummary = async (): Promise<{ summary: string; sources: any[] }> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "대한민국 최신 주요 뉴스 헤드라인 5개를 요약해 줘.",
      config: {
        tools: [{googleSearch: {}}],
      },
    });
    
    const summary = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return { summary, sources };
  } catch (error) {
    console.error("Error fetching news summary:", error);
    return { 
      summary: "뉴스 요약을 가져오는 데 실패했습니다. 잠시 후 다시 시도해주세요.",
      sources: [] 
    };
  }
};
