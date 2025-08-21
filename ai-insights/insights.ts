import { api } from "encore.dev/api";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as transactions from "../transactions/transactions";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { DynamicTool } from "@langchain/core/tools";
import { AIMessage, HumanMessage, BaseMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { SQLDatabase } from "encore.dev/storage/sqldb";

const db = new SQLDatabase("pennywise");

// Get the Gemini API key from environment variables.
// In a production environment, you would use Encore's secret management.
const getGeminiAPIKey = (): string => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        throw new Error("GEMINI_API_KEY environment variable not set.");
    }
    return key;
};
const GeminiAPIKey = getGeminiAPIKey();

// Initialize the GoogleGenerativeAI client with the API key.
const genAI = new GoogleGenerativeAI(GeminiAPIKey);

interface InsightResponse {
    insight: string;
}

// Public API endpoint to generate a financial insight.
export const generate = api({ method: "GET", path: "/insights", auth: false }, async (): Promise<InsightResponse> => {
    const { transactions: allTransactions } = await transactions.list();
    if (allTransactions.length === 0) {
        return { insight: "Not enough data for an insight." };
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
        Based on the following financial transactions, provide a short, actionable insight for the user.
        The insight should be a single sentence.
        Transactions: ${JSON.stringify(allTransactions)}
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return { insight: text };
});

interface ChatRequest {
    message: string;
    sessionId: string;
}

interface ChatResponse {
    response: string;
}

const tools = [
    new DynamicTool({
        name: "get_transactions",
        description: "Get the user's financial transactions.",
        func: async () => {
            const { transactions: allTransactions } = await transactions.list();
            return JSON.stringify(allTransactions);
        },
    }),
];

const model = new ChatGoogleGenerativeAI({
    apiKey: GeminiAPIKey,
    model: "gemini-2.5-pro",
    temperature: 1,
});

const agentExecutor = createReactAgent({
    llm: model,
    tools,
});

const getSessionHistory = async (sessionId: string): Promise<BaseMessage[]> => {
    const results = await db.query`
        SELECT role, content FROM chat_history
        WHERE session_id = ${sessionId}
        ORDER BY created_at ASC
    `;
    const messages: BaseMessage[] = [];
    for await (const row of results) {
        if (row.role === "human") {
            messages.push(new HumanMessage(row.content));
        } else if (row.role === "ai") {
            messages.push(new AIMessage(row.content));
        }
    }
    return messages;
};

export const chat = api(
    { method: "POST", path: "/insights/chat", auth: false },
    async ({ message, sessionId }: ChatRequest): Promise<ChatResponse> => {
        const historyMessages = await getSessionHistory(sessionId);
        const result = await agentExecutor.invoke({
            messages: [...historyMessages, new HumanMessage(message)],
        });

        const response = result.messages[result.messages.length - 1].content;

        // Save new messages to the database
        await db.exec`
            INSERT INTO chat_history (session_id, role, content)
            VALUES (${sessionId}, 'human', ${message})
        `;
        await db.exec`
            INSERT INTO chat_history (session_id, role, content)
            VALUES (${sessionId}, 'ai', ${response})
        `;

        return { response };
    }
);