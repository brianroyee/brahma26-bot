import { NextRequest, NextResponse } from "next/server";
import { fetchAll, execute } from "@/lib/db";
import { validateToken } from "@/lib/auth";
import { InValue } from "@libsql/client";

// GET /api/events - List all events
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category");
        const activeOnly = searchParams.get("active_only") === "true";

        let sql = "SELECT * FROM events WHERE 1=1";
        const params: InValue[] = [];

        if (activeOnly) {
            sql += " AND is_active = 1";
        }
        if (category) {
            sql += " AND category = ?";
            params.push(category);
        }

        sql += " ORDER BY start_time ASC";

        const events = await fetchAll(sql, params);
        return NextResponse.json(events);
    } catch (error) {
        console.error("List events error:", error);
        return NextResponse.json(
            { detail: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST /api/events - Create new event
export async function POST(request: NextRequest) {
    try {
        // Validate auth
        const authHeader = request.headers.get("authorization");
        if (!authHeader || !validateToken(authHeader.replace("Bearer ", ""))) {
            return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
        }

        const data = await request.json();

        await execute(
            `INSERT INTO events (name, category, description, venue, start_time, end_time, rules, hashtags, volunteer_contacts, poster_caption, poster_file_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.name,
                data.category,
                data.description,
                data.venue,
                data.start_time,
                data.end_time,
                data.rules,
                data.hashtags,
                data.volunteer_contacts,
                data.poster_caption,
                data.poster_file_id,
            ]
        );

        return NextResponse.json({ message: "Event created", name: data.name });
    } catch (error) {
        console.error("Create event error:", error);
        return NextResponse.json(
            { detail: "Internal server error" },
            { status: 500 }
        );
    }
}
