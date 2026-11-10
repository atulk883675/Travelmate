import { GoogleGenAI } from "@google/genai";
import { buildItineraryPrompt } from "./itinerary.prompt.js";
import { buildAssistantPrompt } from "./assistant.prompt.js";

export const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API key is missing from environment variables.");
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey,
  });

  return ai;
};

export const generateText = async (prompt) => {
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: prompt,
  });

  return response.text;
};

export const generateItinerary = async (trip) => {
  const ai = getGeminiClient();

  const prompt = buildItineraryPrompt(trip);

  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  const generatedText = response.text;

  if (!generatedText) {
    throw new Error("Gemini returned an empty itinerary.");
  }

  let parsedResponse;

  try {
    parsedResponse = JSON.parse(generatedText);
  } catch {
    throw new Error("Gemini returned invalid JSON.");
  }

  if (!Array.isArray(parsedResponse.itinerary)) {
    throw new Error("Gemini returned an invalid itinerary structure.");
  }

  return parsedResponse;
};



export const generateAssistantResponse = async (trip, userMessage) => {
  const ai = getGeminiClient();

  const prompt = buildAssistantPrompt(trip, userMessage);

  console.time("Gemini Assistant Response");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    console.timeEnd("Gemini Assistant Response");

    const generatedText = response.text;

    if (!generatedText) {
      throw new Error("Gemini returned an empty assistant response.");
    }

    let parsedResponse;

    try {
      parsedResponse = JSON.parse(generatedText);
    } catch {
      throw new Error("Gemini returned invalid JSON.");
    }

    if (
      typeof parsedResponse.message !== "string" ||
      typeof parsedResponse.canApply !== "boolean" ||
      !Array.isArray(parsedResponse.itinerary)
    ) {
      throw new Error("Gemini returned an invalid assistant response.");
    }

    return parsedResponse;

  } catch (error) {
    console.timeEnd("Gemini Assistant Response");
    throw error;
  }
};


