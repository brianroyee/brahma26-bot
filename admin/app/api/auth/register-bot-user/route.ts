import { NextRequest, NextResponse } from "next/server";
import { execute } from "@/lib/db";

export async function POST(request: NextRequest) {
    try {
        const { telegram_id, username } = await request.json();

        if (!telegram_id) {
            return NextResponse.json(
                { detail: "Missing telegram_id" },
                { status: 400 }
            );
        }

        // Insert or ignore if exists
        await execute(
            `INSERT OR IGNORE INTO users (telegram_id, username, created_at, last_active)
             VALUES (?, ?, datetime('now'), datetime('now'))`,
            [telegram_id, username]
        );

        // Update last active
        await execute(
            "UPDATE users SET last_active = datetime('now') WHERE telegram_id = ?",
            [telegram_id]
        );

        return NextResponse.json({ message: "User registered" });
    } catch (error) {
        console.error("Register bot user error:", error);
        return NextResponse.json(
            { detail: "Internal server error" },
            { status: 500 }
        );
    }
}
