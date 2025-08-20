import { api } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";

// Define the database named 'pennywise'
const db = new SQLDatabase("pennywise", {
    migrations: "./migrations",
});

interface Transaction {
    id: number;
    description: string;
    amount: number;
    category: string;
    timestamp: string;
}

interface AddTransactionParams {
    description: string;
    amount: number;
    category: string;
}

// Add a new transaction
export const add = api({ method: "POST", path: "/transactions", auth: false }, async (params: AddTransactionParams): Promise<Transaction> => {
    const result = await db.queryRow`
        INSERT INTO transactions (description, amount, category)
        VALUES (${params.description}, ${params.amount}, ${params.category})
        RETURNING *;
    `;
    if (!result) {
        throw new Error("Failed to create transaction");
    }
    return {
        id: result.id,
        description: result.description,
        amount: result.amount,
        category: result.category,
        timestamp: result.timestamp,
    };
});

// List all transactions
export const list = api({ method: "GET", path: "/transactions", auth: false }, async (): Promise<{ transactions: Transaction[] }> => {
    const transactions: Transaction[] = [];
    for await (const row of db.query<Transaction>`
        SELECT * FROM transactions
        ORDER BY timestamp DESC
    `) {
        transactions.push(row);
    }
    return { transactions };
});

// Gets the total balance of all transactions
export const balance = api({ method: "GET", path: "/transactions/balance", auth: false }, async (): Promise<{ balance: number }> => {
    const result = await db.queryRow`
        SELECT SUM(amount) AS total FROM transactions
    `;
    if (!result) {
        return { balance: 0 };
    }
    return { balance: result.total || 0 };
});