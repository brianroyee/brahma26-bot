import { NextResponse } from "next/server";
import { fetchOne, execute } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST() {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || "admin@brahma26.com";
        const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

        const existing = await fetchOne<{ id: number }>(
            "SELECT id FROM admins WHERE email = ?",
            [adminEmail]
        );

        const hashedPassword = hashPassword(adminPassword);

        if (existing) {
            // Update existing admin's password
            await execute(
                "UPDATE admins SET password_hash = ? WHERE email = ?",
                [hashedPassword, adminEmail]
            );
            return NextResponse.json({
                message: "Admin password updated",
                email: adminEmail
            });
        } else {
            // Create new admin
            await execute(
                "INSERT INTO admins (email, password_hash, role) VALUES (?, ?, ?)",
                [adminEmail, hashedPassword, "super_admin"]
            );
            return NextResponse.json({
                message: "Admin created",
                email: adminEmail
            });
        }
    } catch (error) {
        console.error("Setup error:", error);
        return NextResponse.json(
            { detail: "Internal server error" },
            { status: 500 }
        );
    }
}
