import { NextRequest, NextResponse } from "next/server";
import { fetchOne, execute } from "@/lib/db";
import { validateToken } from "@/lib/auth";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/events/[id] - Get single event
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const event = await fetchOne("SELECT * FROM events WHERE id = ?", [id]);

        if (!event) {
            return NextResponse.json(
                { detail: "Event not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(event);
    } catch (error) {
        console.error("Get event error:", error);
        return NextResponse.json(
            { detail: "Internal server error" },
            { status: 500 }
        );
    }
}

// PUT /api/events/[id] - Update event
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        // Validate auth
        const authHeader = request.headers.get("authorization");
        if (!authHeader || !validateToken(authHeader.replace("Bearer ", ""))) {
            return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const data = await request.json();

        // Check if event exists
        const existing = await fetchOne("SELECT id FROM events WHERE id = ?", [id]);
        if (!existing) {
            return NextResponse.json(
                { detail: "Event not found" },
                { status: 404 }
            );
        }

        // Build dynamic update
        const updates: string[] = [];
        const values: unknown[] = [];

        const fields = [
            "name", "category", "description", "venue", "start_time", "end_time",
            "rules", "hashtags", "volunteer_contacts", "poster_caption", "poster_file_id"
        ];

        for (const field of fields) {
            if (data[field] !== undefined) {
                updates.push(`${field} = ?`);
                values.push(data[field]);
            }
        }

        if (data.is_active !== undefined) {
            updates.push("is_active = ?");
            values.push(data.is_active ? 1 : 0);
        }

        if (updates.length > 0) {
            values.push(id);
            await execute(`UPDATE events SET ${updates.join(", ")} WHERE id = ?`, values);
        }

        return NextResponse.json({ message: "Event updated", id });
    } catch (error) {
        console.error("Update event error:", error);
        return NextResponse.json(
            { detail: "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE /api/events/[id] - Delete event
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        // Validate auth
        const authHeader = request.headers.get("authorization");
        if (!authHeader || !validateToken(authHeader.replace("Bearer ", ""))) {
            return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const existing = await fetchOne("SELECT id FROM events WHERE id = ?", [id]);
        if (!existing) {
            return NextResponse.json(
                { detail: "Event not found" },
                { status: 404 }
            );
        }

        await execute("DELETE FROM events WHERE id = ?", [id]);

        return NextResponse.json({ message: "Event deleted", id });
    } catch (error) {
        console.error("Delete event error:", error);
        return NextResponse.json(
            { detail: "Internal server error" },
            { status: 500 }
        );
    }
}
