import { NextRequest, NextResponse } from "next/server";
import { validateToken, SIMPLE_SESSION_TOKEN } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json(
                { detail: "Not authenticated" },
                { status: 401 }
            );
        }

        const token = authHeader.replace("Bearer ", "");

        if (!validateToken(token)) {
            return NextResponse.json(
                { detail: "Invalid token" },
                { status: 401 }
            );
        }

        // Return simulated admin user
        return NextResponse.json({
            id: 1,
            email: process.env.ADMIN_EMAIL || "admin@brahma26.com",
            role: "super_admin"
        });
    } catch (error) {
        console.error("Me error:", error);
        return NextResponse.json(
            { detail: "Internal server error" },
            { status: 500 }
        );
    }
}
