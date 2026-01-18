import { NextRequest, NextResponse } from "next/server";
import { execute } from "@/lib/db";

// POST /api/telemetry/log - Log interaction from bot
export async function POST(request: NextRequest) {
    try {
        const { user_id, action, metadata } = await request.json();

        if (!user_id || !action) {
            return NextResponse.json(
                { detail: "user_id and action required" },
                { status: 400 }
            );
        }

        await execute(
            `INSERT INTO telemetry (user_id, action, metadata, created_at)
             VALUES (?, ?, ?, datetime('now'))`,
            [user_id, action, metadata || ""]
        );

        return NextResponse.json({ message: "Logged" });
    } catch (error) {
        console.error("Log telemetry error:", error);
        return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
    }
}
