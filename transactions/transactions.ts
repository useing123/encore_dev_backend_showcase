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
    timestamp?: string;
}

/**
 * Adds a new transaction.
 * @param params The transaction details.
 * @returns The created transaction.
 */
export const add = api({ method: "POST", path: "/transactions", auth: false }, async (params: AddTransactionParams): Promise<Transaction> => {
    const amountInCents = Math.trunc(params.amount * 100);
    let result;
    if (params.timestamp) {
        result = await db.queryRow`
            INSERT INTO transactions (description, amount, category, "timestamp")
            VALUES (${params.description}, ${amountInCents}::INTEGER, ${params.category}, ${params.timestamp})
            RETURNING id, description, amount::bigint, category, "timestamp";
        `;
    } else {
        result = await db.queryRow`
            INSERT INTO transactions (description, amount, category)
            VALUES (${params.description}, ${amountInCents}::INTEGER, ${params.category})
            RETURNING id, description, amount::bigint, category, "timestamp";
        `;
    }
    if (!result) {
        throw new Error("Failed to create transaction");
    }
    return {
        id: result.id,
        description: result.description,
        amount: result.amount / 100,
        category: result.category,
        timestamp: result.timestamp,
    };
});

/**
 * Lists all transactions.
 * @returns A list of all transactions.
 */
export const list = api({ method: "GET", path: "/transactions", auth: false }, async (): Promise<{ transactions: Transaction[] }> => {
    const transactions: Transaction[] = [];
    for await (const row of db.query<any>`
        SELECT id, description, amount::bigint, category, "timestamp" FROM transactions
        ORDER BY timestamp DESC
    `) {
        transactions.push({
            id: row.id,
            description: row.description,
            amount: row.amount / 100,
            category: row.category,
            timestamp: row.timestamp,
        });
    }
    return { transactions };
});

/**
 * Gets the total balance of all transactions.
 * @returns The total balance.
 */
export const balance = api({ method: "GET", path: "/transactions/balance", auth: false }, async (): Promise<{ balance: number }> => {
    const result = await db.queryRow`
        SELECT SUM(amount)::bigint AS total FROM transactions
    `;
    if (!result || !result.total) {
        return { balance: 0 };
    }
    return { balance: result.total / 100 || 0 };
});

/**
 * Deletes a transaction by its ID.
 * @param id The ID of the transaction to delete.
 */
export const del = api({ method: "DELETE", path: "/transactions/:id", auth: false }, async ({ id }: { id: number }): Promise<{ status: string }> => {
    await db.exec`
        DELETE FROM transactions
        WHERE id = ${id}
    `;
    return { status: "deleted" };
});

interface UpdateTransactionParams {
    description?: string;
    amount?: number;
    category?: string;
    timestamp?: string;
}

/**
 * Updates a transaction by its ID.
 * Only the provided fields will be updated.
 * @param id The ID of the transaction to update.
 * @param params The fields to update.
 * @returns The updated transaction.
 */
export const update = api({ method: "PUT", path: "/transactions/:id", auth: false }, async ({ id, ...params }: { id: number } & UpdateTransactionParams): Promise<Transaction> => {
    const current = await db.queryRow`
        SELECT description, amount, category, "timestamp" FROM transactions WHERE id = ${id}
    `;
    if (!current) {
        throw new Error("Transaction not found");
    }

    const newDescription = params.description ?? current.description;
    const newAmount = params.amount ? Math.trunc(params.amount * 100) : current.amount;
    const newCategory = params.category ?? current.category;
    const newTimestamp = params.timestamp ?? current.timestamp;

    const result = await db.queryRow`
        UPDATE transactions
        SET description = ${newDescription}, amount = ${newAmount}, category = ${newCategory}, "timestamp" = ${newTimestamp}
        WHERE id = ${id}
        RETURNING id, description, amount::bigint, category, "timestamp"
    `;
    if (!result) {
        throw new Error("Failed to update transaction");
    }
    return {
        id: result.id,
        description: result.description,
        amount: result.amount / 100,
        category: result.category,
        timestamp: result.timestamp,
    };
});
