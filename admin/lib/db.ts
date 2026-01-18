import { createClient, Client, InValue } from "@libsql/client";

// Lazy-load client to ensure env vars are available
let client: Client | null = null;

function getClient(): Client {
    if (!client) {
        if (!process.env.TURSO_DATABASE_URL) {
            throw new Error("TURSO_DATABASE_URL environment variable is not set");
        }
        client = createClient({
            url: process.env.TURSO_DATABASE_URL,
            authToken: process.env.TURSO_AUTH_TOKEN,
        });
    }
    return client;
}

// Query helper - returns array of rows
export async function query<T = Record<string, unknown>>(
    sql: string,
    args: InValue[] = []
): Promise<T[]> {
    const result = await getClient().execute({ sql, args });
    return result.rows as T[];
}

// Execute helper - for INSERT/UPDATE/DELETE
export async function execute(
    sql: string,
    args: InValue[] = []
): Promise<number> {
    const result = await getClient().execute({ sql, args });
    return result.rowsAffected;
}

// Fetch one row
export async function fetchOne<T = Record<string, unknown>>(
    sql: string,
    args: InValue[] = []
): Promise<T | null> {
    const rows = await query<T>(sql, args);
    return rows[0] || null;
}

// Fetch all rows
export async function fetchAll<T = Record<string, unknown>>(
    sql: string,
    args: InValue[] = []
): Promise<T[]> {
    return query<T>(sql, args);
}

export default getClient;
