import { db } from "@/lib/db";
import { users, verifications } from "@/lib/db/schema";
import { apiSuccess, Errors } from "@/lib/api";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";
import { sendPasswordResetEmail } from "@/lib/auth/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      throw Errors.badRequest("Email is required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw Errors.badRequest("Invalid email format");
    }

    // Check if user exists (but don't reveal this to the client)
    const user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (user) {
      // Generate reset token
      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

      // Store verification token
      await db.insert(verifications).values({
        id: randomBytes(16).toString("hex"),
        identifier: email.toLowerCase(),
        value: token,
        expiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";
      const resetUrl = `${baseUrl}/reset-password?token=${token}`;

      // Send password reset email
      await sendPasswordResetEmail(email, resetUrl, user.name ?? undefined);
    }

    // Always return success to prevent email enumeration
    return apiSuccess({
      success: true,
      message: "If an account with this email exists, a password reset link has been sent.",
    });
  } catch (error: any) {
    // Don't reveal whether email exists or not
    console.error("Forgot password error:", error);
    return apiSuccess({
      success: true,
      message: "If an account with this email exists, a password reset link has been sent.",
    });
  }
}
