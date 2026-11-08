import { generateText } from "../services/ai/gemini.service.js";

export const testGemini = async (req, res) => {
  try {
    console.log("1. Gemini test endpoint reached");

    const prompt = "Suggest three popular tourist attractions in Paris.";

    console.time("Gemini API response time");

    console.log("2. Sending prompt to Gemini...");

    const answer = await generateText(prompt);

    console.timeEnd("Gemini API response time");

    console.log("3. Gemini response received");

    return res.status(200).json({
      success: true,
      message: "Gemini API connected successfully!",
      answer: answer,
    });

  } catch (error) {
    console.timeEnd("Gemini API response time");

    console.error("Gemini API Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate response from Gemini.",
      error: error.message,
    });
  }
};