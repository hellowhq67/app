import { auth } from "@/lib/auth/auth";
import { apiSuccess, handleApiError, requireAuth, Errors } from "@/lib/api";
import { headers } from "next/headers";

export async function POST(request: Request) {
  try {
    await requireAuth();

    const body = await request.json();
    const { currentPassword, newPassword, revokeOtherSessions = false } = body;

    if (!currentPassword || !newPassword) {
      throw Errors.badRequest("Current password and new password are required");
    }

    if (newPassword.length < 8) {
      throw Errors.badRequest("New password must be at least 8 characters");
    }

    // Use Better Auth's changePassword API
    await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions,
      },
      headers: await headers(),
    });

    return apiSuccess({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error: any) {
    // Handle Better Auth specific errors
    if (error?.message?.includes("Invalid password")) {
      return Errors.badRequest("Current password is incorrect").toResponse();
    }
    return handleApiError(error, "POST /api/user/change-password");
  }
}
