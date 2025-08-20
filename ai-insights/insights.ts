import { api } from "encore.dev/api";
import { secret } from "encore.dev/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as transactions from "../transactions/transactions";

// Define an Encore Secret for the Gemini API key.
const GeminiAPIKey = secret("GeminiAPIKey");

// Initialize the GoogleGenerativeAI client with the API key.
const genAI = new GoogleGenerativeAI(GeminiAPIKey());

interface InsightResponse {
    insight: string;
}

// Public API endpoint to generate a financial insight.
export const generate = api({ method: "GET", path: "/insights", auth: false }, async (): Promise<InsightResponse> => {
    // Get the most recent transactions.
    const { transactions: allTransactions } = await transactions.list();

    // Take the last 10 transactions.
    const latestTransactions = allTransactions.slice(0, 10);

    // Create a prompt for the Gemini model.
    const prompt = `Based on the following transactions, provide a single-sentence financial insight:\n\n${JSON.stringify(latestTransactions, null, 2)}`;

    // Send the prompt to the Gemini API.
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Return the generated text.
    return { insight: text };
});