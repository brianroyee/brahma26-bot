import { NextResponse } from "next/server";
import { execute } from "@/lib/db";

// POST /api/migrate - Run database migrations
// This is a one-time endpoint to add missing columns
export async function POST() {
    try {
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
                if (error.message?.includes("duplicate column")) {
                    results.push(`⏭️ Column already exists: ${sql}`);
                } else {
                    results.push(`❌ Failed: ${sql} - ${error.message}`);
                }
            }
        }

        return NextResponse.json({
            message: "Migration complete",
            results
        });
    } catch (error) {
        console.error("Migration error:", error);
        return NextResponse.json(
            { detail: "Migration failed" },
            { status: 500 }
        );
    }
}
