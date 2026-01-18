import { NextRequest, NextResponse } from "next/server";
import { fetchAll, fetchOne, execute } from "@/lib/db";
import { validateToken } from "@/lib/auth";

// GET /api/content - List all content or get by key
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const key = searchParams.get("key");

        if (key) {
            const content = await fetchOne<{ key: string; content: string }>(
                "SELECT key, content FROM content_pages WHERE key = ?",
                [key]
            );
            if (!content) {
                return NextResponse.json({ detail: "Content not found" }, { status: 404 });
            }
            return NextResponse.json(content);
        }

        const allContent = await fetchAll("SELECT key, content, updated_at FROM content_pages ORDER BY key");
        return NextResponse.json(allContent);
    } catch (error) {
        console.error("Get content error:", error);
        return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
    }
}

// POST /api/content - Create or update content
export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization");
        if (!authHeader || !validateToken(authHeader.replace("Bearer ", ""))) {
            return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
        }

        const { key, content } = await request.json();

        if (!key) {
            return NextResponse.json({ detail: "Key is required" }, { status: 400 });
        }

        const existing = await fetchOne("SELECT key FROM content_pages WHERE key = ?", [key]);

        if (existing) {
            await execute(
                "UPDATE content_pages SET content = ?, updated_at = datetime('now') WHERE key = ?",
                [content, key]
            );
        } else {
            await execute(
                "INSERT INTO content_pages (key, content, updated_at) VALUES (?, ?, datetime('now'))",
                [key, content]
            );
        }

        return NextResponse.json({ message: "Content saved", key });
    } catch (error) {
        console.error("Save content error:", error);
        return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
    }
}
