import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Initializes the Gemini AI client.
 * In Expo, environment variables must start with EXPO_PUBLIC_ to be visible.
 */
export const getAiClient = () => {
  // Use EXPO_PUBLIC_API_KEY in your .env file
  const apiKey = process.env.EXPO_PUBLIC_API_KEY;
  
  if (!apiKey) {
    console.warn("Gemini API Key is missing! Check your .env file.");
  }
  
  return new GoogleGenerativeAI(apiKey);
};

export const MODELS = {
  // Using gemini-1.5-flash as it is the stable, fast version for mobile
  text: 'gemini-1.5-flash',
  vision: 'gemini-1.5-flash', 
};