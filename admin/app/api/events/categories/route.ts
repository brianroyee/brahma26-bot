import { NextResponse } from "next/server";

// GET /api/events/categories - Return fixed categories
export async function GET() {
    return NextResponse.json(["Technical", "Cultural", "General"]);
}
