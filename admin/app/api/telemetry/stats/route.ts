import { NextRequest, NextResponse } from "next/server";
import { fetchOne, fetchAll } from "@/lib/db";
import { validateToken } from "@/lib/auth";

// GET /api/telemetry/stats - Get analytics stats
export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization");
        if (!authHeader || !validateToken(authHeader.replace("Bearer ", ""))) {
            return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
        }

        const totalUsers = await fetchOne<{ count: number }>(
            "SELECT COUNT(*) as count FROM users"
        );

        const totalEvents = await fetchOne<{ count: number }>(
            "SELECT COUNT(*) as count FROM events"
        );

        const activeEvents = await fetchOne<{ count: number }>(
            "SELECT COUNT(*) as count FROM events WHERE is_active = 1"
        );

        const totalInteractions = await fetchOne<{ count: number }>(
            "SELECT COUNT(*) as count FROM telemetry"
        );

        const recentInteractions = await fetchAll(
            `SELECT action, COUNT(*) as count 
             FROM telemetry 
             WHERE created_at > datetime('now', '-7 days')
             GROUP BY action 
             ORDER BY count DESC
             LIMIT 10`
        );

        return NextResponse.json({
            total_users: totalUsers?.count || 0,
            events: totalEvents?.count || 0,
            activeEvents: activeEvents?.count || 0,
            interactions: totalInteractions?.count || 0,
            recentActivity: recentInteractions
        });
    } catch (error) {
        console.error("Get telemetry stats error:", error);
        return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
    }
}
