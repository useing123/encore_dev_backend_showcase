import { api } from "encore.dev/api";
import { secret } from "encore.dev/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as transactions from "../transactions/transactions";

// Define an Encore Secret for the Gemini API key.
// const GeminiAPIKey = secret("GeminiAPIKey");

// Initialize the GoogleGenerativeAI client with the API key.
// const genAI = new GoogleGenerativeAI(GeminiAPIKey());

interface InsightResponse {
    insight: string;
}

// Public API endpoint to generate a financial insight.
export const generate = api({ method: "GET", path: "/insights", auth: false }, async (): Promise<InsightResponse> => {
    // The AI-insights service is temporarily disabled.
    return { insight: "AI insights are temporarily unavailable." };
});