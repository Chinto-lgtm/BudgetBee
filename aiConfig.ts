
import { GoogleGenAI } from "@google/genai";

// Standard configuration for Gemini 3 models following coding guidelines.
export const getAiClient = () => {
  // Always use a named parameter and direct process.env.API_KEY access as per instructions.
  // We assume process.env.API_KEY is pre-configured and valid.
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const MODELS = {
  // Basic Text Tasks: gemini-3-flash-preview
  text: 'gemini-3-flash-preview',
  // Multimodal support: gemini-3-flash-preview also supports image input
  vision: 'gemini-3-flash-preview', 
};
