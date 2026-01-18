import { NextRequest, NextResponse } from "next/server";
import { fetchAll, fetchOne, execute } from "@/lib/db";
import { validateToken } from "@/lib/auth";

// GET /api/settings - Get all settings
export async function GET() {
    try {
        const settings = await fetchAll<{ key: string; value: string }>(
            "SELECT key, value FROM settings ORDER BY key"
        );
        return NextResponse.json(settings);
    } catch (error) {
        console.error("Get settings error:", error);
        return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
    }
}

// POST /api/settings - Update settings
export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization");
        if (!authHeader || !validateToken(authHeader.replace("Bearer ", ""))) {
            return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
        }

        const settings = await request.json();

        if (!Array.isArray(settings)) {
            return NextResponse.json({ detail: "Settings must be an array" }, { status: 400 });
        }

        for (const { key, value } of settings) {
            if (!key) continue;

            const existing = await fetchOne("SELECT key FROM settings WHERE key = ?", [key]);

            if (existing) {
                await execute("UPDATE settings SET value = ? WHERE key = ?", [value, key]);
            } else {
                await execute("INSERT INTO settings (key, value) VALUES (?, ?)", [key, value]);
            }
        }

        return NextResponse.json({ message: "Settings updated" });
    } catch (error) {
        console.error("Update settings error:", error);
        return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
    }
}
