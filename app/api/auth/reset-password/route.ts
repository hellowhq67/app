import { db } from "@/lib/db";
import { users, verifications, accounts } from "@/lib/db/schema";
import { apiSuccess, Errors, handleApiError } from "@/lib/api";
import { eq, and, gt } from "drizzle-orm";
import { hashPassword } from "@/lib/auth/password";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    if (!token) {
      throw Errors.badRequest("Reset token is required");
    }

    if (!newPassword) {
      throw Errors.badRequest("New password is required");
    }

    if (newPassword.length < 8) {
      throw Errors.badRequest("Password must be at least 8 characters");
    }

    // Find the verification token
    const verification = await db.query.verifications.findFirst({
      where: and(
        eq(verifications.value, token),
        gt(verifications.expiresAt, new Date())
      ),
    });

    if (!verification) {
      throw Errors.badRequest("Reset link has expired or is invalid. Please request a new one.");
    }

    // Find the user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, verification.identifier),
    });

    if (!user) {
      throw Errors.badRequest("User not found.");
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update the password in the accounts table (where Better Auth stores passwords)
    await db.update(accounts)
      .set({ password: hashedPassword })
      .where(and(
        eq(accounts.userId, user.id),
        eq(accounts.providerId, "credential")
      ));

    // Delete the used verification token
    await db.delete(verifications)
      .where(eq(verifications.id, verification.id));

    return apiSuccess({
      success: true,
      message: "Password reset successfully. You can now sign in with your new password.",
    });
  } catch (error: any) {
    if (error?.status) {
      return error.toResponse();
    }
    return handleApiError(error, "POST /api/auth/reset-password");
  }
}
