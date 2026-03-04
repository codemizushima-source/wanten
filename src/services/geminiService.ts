import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const generateDogIllustration = async (breed: string): Promise<string | null> => {
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set");
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `A high-quality, cute, 3D Pixar-style digital art illustration of a ${breed} dog. The dog should be the main focus, centered, on a simple soft pastel background. Professional lighting, clean lines, high detail.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error generating dog illustration:", error);
    return null;
  }
};
