import { NextResponse } from "next/server";
import { fetchOne } from "@/lib/db";

// GET /api/health - Health check endpoint
export async function GET() {
    try {
        // Test database connection
        const dbCheck = await fetchOne("SELECT 1 as ok");

        return NextResponse.json({
            status: "healthy",
            timestamp: new Date().toISOString(),
            database: dbCheck ? "connected" : "disconnected",
            version: "2.0.0",
            platform: "vercel"
        });
    } catch (error) {
        console.error("Health check error:", error);
        return NextResponse.json({
            status: "unhealthy",
            timestamp: new Date().toISOString(),
            database: "error",
            error: String(error)
        }, { status: 500 });
    }
}
