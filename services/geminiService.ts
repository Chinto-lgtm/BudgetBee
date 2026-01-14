
import { getAiClient, MODELS } from "../aiConfig";

export const checkNiyat = async (reason: string): Promise<string> => {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: MODELS.text,
      contents: `Child wants to spend savings on "${reason}". Is this impulsive? Reply with short, gentle, Islamic-inspired financial advice (max 2 sentences). Focus on mindfulness and barakah.`,
    });
    return response.text || "Think carefully about your choice.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Consider if this purchase brings long-term value.";
  }
};

export const verifyTaskImage = async (base64Image: string, taskTitle: string): Promise<{ confidence: number; feedback: string }> => {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: MODELS.vision,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: `Analyze this image. The task is "${taskTitle}". Provide a confidence score (0-100) that the task is complete and a short feedback message. Return as valid JSON with keys: confidence, feedback.` }
        ]
      },
      config: {
        responseMimeType: 'application/json'
      }
    });
    // Ensure we parse the text properly as JSON
    const text = response.text || '{"confidence": 50, "feedback": "Unable to verify fully."}';
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return { confidence: 0, feedback: "Error processing image." };
  }
};
