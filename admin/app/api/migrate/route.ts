import { NextResponse } from "next/server";
import { execute } from "@/lib/db";

// Run database migrations - adds missing columns
async function runMigrations() {
    const migrations = [
        "ALTER TABLE events ADD COLUMN registration_fee TEXT",
        "ALTER TABLE events ADD COLUMN registration_link TEXT",
        "ALTER TABLE events ADD COLUMN results TEXT",
    ];

    const results: string[] = [];

    for (const sql of migrations) {
        try {
            await execute(sql);
            results.push(`✅ ${sql}`);
        } catch (error: any) {
            // Column might already exist
            if (error.message?.includes("duplicate column") || error.message?.includes("already exists")) {
                results.push(`⏭️ Already exists: ${sql}`);
            } else {
                results.push(`❌ Failed: ${sql} - ${error.message}`);
            }
        }
    }

    return results;
}

// GET /api/migrate - Run migrations (easier to trigger via browser)
export async function GET() {
    try {
        const results = await runMigrations();
        return NextResponse.json({
            message: "Migration complete",
            results
        });
    } catch (error) {
        console.error("Migration error:", error);
        return NextResponse.json(
            { detail: "Migration failed", error: String(error) },
            { status: 500 }
        );
    }
}

// POST /api/migrate - Also support POST
export async function POST() {
    return GET();
}
