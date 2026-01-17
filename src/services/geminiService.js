import { getAiClient, MODELS } from "../config/aiConfig";

// 1. Initialize the AI Client using the config we created
const genAI = getAiClient();

// 2. Define Models using the standard constants
const textModel = genAI.getGenerativeModel({ model: MODELS.text });
const visionModel = genAI.getGenerativeModel({ model: MODELS.vision });

/**
 * Checks the "Niyat" (Intention) behind a purchase.
 */
export const checkNiyat = async (reason) => {
  try {
    const prompt = `Child wants to spend savings on "${reason}". Is this impulsive? Reply with short, gentle, Islamic-inspired financial advice (max 2 sentences). Focus on mindfulness and barakah.`;
    
    const result = await textModel.generateContent(prompt);
    const response = await result.response;
    return response.text() || "Think carefully about your choice.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Consider if this purchase brings long-term value.";
  }
};

/**
 * Verifies if a task was completed by analyzing an image.
 */
export const verifyTaskImage = async (base64Image, taskTitle) => {
  try {
    const prompt = `Analyze this image. The task is "${taskTitle}". Provide a confidence score (0-100) that the task is complete and a short feedback message. Return ONLY valid JSON with keys: "confidence" (number) and "feedback" (string).`;
    
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: "image/jpeg",
      },
    };

    const result = await visionModel.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // Clean the text to ensure it's valid JSON
    const cleanText = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanText);

  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return { confidence: 0, feedback: "Error processing image." };
  }
};