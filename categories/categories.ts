import { api } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";

const db = new SQLDatabase("pennywise");

interface Category {
    id: number;
    name: string;
}

/**
 * Adds a new category.
 * @param params The category details.
 * @returns The created category.
 */
export const add = api({ method: "POST", path: "/categories", auth: false }, async ({ name }: { name: string }): Promise<Category> => {
    const result = await db.queryRow<Category>`
        INSERT INTO categories (name)
        VALUES (${name})
        RETURNING id, name
    `;
    if (!result) {
        throw new Error("Failed to create category");
    }
    return result;
});

/**
 * Lists all categories.
 * @returns A list of all categories.
 */
export const list = api({ method: "GET", path: "/categories", auth: false }, async (): Promise<{ categories: Category[] }> => {
    const categories: Category[] = [];
    for await (const row of db.query<Category>`
        SELECT id, name FROM categories
        ORDER BY name ASC
    `) {
        categories.push(row);
    }
    return { categories };
});

/**
 * Deletes a category by its name.
 * @param name The name of the category to delete.
 */
export const del = api({ method: "DELETE", path: "/categories/:name", auth: false }, async ({ name }: { name: string }): Promise<{ status: string }> => {
    await db.exec`
        DELETE FROM categories
        WHERE name = ${name}
    `;
    return { status: "deleted" };
});