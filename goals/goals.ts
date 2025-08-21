import { api } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";

const db = new SQLDatabase("pennywise");

interface Goal {
    id: number;
    week_start_date: string;
    amount: number;
}

interface GoalStatus {
    goal: number;
    spent: number;
    remaining: number;
}

/**
 * Sets or updates the spending goal for the current week.
 * @param params The goal details.
 * @returns The created or updated goal.
 */
export const set = api({ method: "POST", path: "/goals", auth: false }, async ({ amount }: { amount: number }): Promise<Goal> => {
    const amountInCents = Math.trunc(amount * 100);
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // adjust when day is sunday
    const weekStartDate = new Date(today.setDate(diff)).toISOString().split('T')[0];

    const result = await db.queryRow<Goal>`
        INSERT INTO goals (week_start_date, amount)
        VALUES (${weekStartDate}, ${amountInCents})
        ON CONFLICT (week_start_date) DO UPDATE
        SET amount = ${amountInCents}
        RETURNING id, week_start_date, amount
    `;
    if (!result) {
        throw new Error("Failed to set goal");
    }
    return { ...result, amount: result.amount / 100 };
});

/**
 * Gets the spending goal for the current week and tracks progress.
 * @returns The goal status for the current week.
 */
export const status = api({ method: "GET", path: "/goals", auth: false }, async (): Promise<GoalStatus> => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // adjust when day is sunday
    const weekStartDate = new Date(today.setDate(diff)).toISOString().split('T')[0];
    const weekEndDate = new Date(new Date(weekStartDate).getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const goalResult = await db.queryRow<{ amount: number }>`
        SELECT amount FROM goals WHERE week_start_date = ${weekStartDate}
    `;
    const goalAmount = goalResult ? goalResult.amount : 0;

    const spentResult = await db.queryRow`
        SELECT SUM(amount)::bigint AS total FROM transactions
        WHERE "timestamp"::date >= ${weekStartDate} AND "timestamp"::date <= ${weekEndDate}
    `;
    const spentAmount = spentResult && spentResult.total ? spentResult.total : 0;

    return {
        goal: goalAmount / 100,
        spent: spentAmount / 100,
        remaining: (goalAmount - spentAmount) / 100,
    };
});