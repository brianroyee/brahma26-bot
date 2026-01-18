import { NextRequest, NextResponse } from "next/server";
import { fetchAll, execute } from "@/lib/db";
import { validateToken } from "@/lib/auth";

// GET /api/announcements - List all announcements
export async function GET() {
    try {
        const announcements = await fetchAll(
            "SELECT * FROM announcements ORDER BY created_at DESC"
        );
        return NextResponse.json(announcements);
    } catch (error) {
        console.error("List announcements error:", error);
        return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
    }
}

// POST /api/announcements - Create announcement
export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization");
        if (!authHeader || !validateToken(authHeader.replace("Bearer ", ""))) {
            return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
        }

        const { title, message, priority } = await request.json();

        if (!message) {
            return NextResponse.json({ detail: "Message is required" }, { status: 400 });
        }

        await execute(
            `INSERT INTO announcements (title, message, priority, created_at)
             VALUES (?, ?, ?, datetime('now'))`,
            [title || "Announcement", message, priority || "normal"]
        );

        return NextResponse.json({ message: "Announcement created" });
    } catch (error) {
        console.error("Create announcement error:", error);
        return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
    }
}

// DELETE /api/announcements - Delete announcement (with id in body)
export async function DELETE(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization");
        if (!authHeader || !validateToken(authHeader.replace("Bearer ", ""))) {
            return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
        }

        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ detail: "ID is required" }, { status: 400 });
        }

        await execute("DELETE FROM announcements WHERE id = ?", [id]);

        return NextResponse.json({ message: "Announcement deleted" });
    } catch (error) {
        console.error("Delete announcement error:", error);
        return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
    }
}
