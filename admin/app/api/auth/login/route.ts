import { NextRequest, NextResponse } from "next/server";
import { fetchOne } from "@/lib/db";
import { verifyPassword, createAccessToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { detail: "Email and password required" },
                { status: 400 }
            );
        }

        const user = await fetchOne<{
            id: number;
            email: string;
            password_hash: string;
            role: string;
        }>("SELECT id, email, password_hash, role FROM admins WHERE email = ?", [email]);

        if (!user) {
            return NextResponse.json(
                { detail: "Invalid credentials" },
                { status: 401 }
            );
        }

        if (!verifyPassword(password, user.password_hash)) {
            return NextResponse.json(
                { detail: "Invalid credentials" },
                { status: 401 }
            );
        }

        const token = createAccessToken();

        return NextResponse.json({
            access_token: token,
            token_type: "bearer",
            user: { id: user.id, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { detail: "Internal server error" },
            { status: 500 }
        );
    }
}
