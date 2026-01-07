import { getUser, updateUser } from "@/lib/db/queries";
import { apiSuccess, handleApiError, apiError, requireAuth } from "@/lib/api";

interface SecurityStatus {
  twoFAEnabled: boolean;
  hasPassword: boolean;
  lastPasswordChange?: Date;
}

export async function GET() {
  try {
    const { userId } = await requireAuth();
    const user = await getUser(userId);

    if (!user) {
      return apiError(404, "User not found", "NOT_FOUND");
    }

    // Check if user has a password set
    // This is a simplified check - in a real app you'd check the accounts table
    const securityStatus: SecurityStatus = {
      twoFAEnabled: false, // Would check from 2FA settings table
      hasPassword: true, // Would check if user has password auth
    };

    return apiSuccess(securityStatus);
  } catch (error) {
    return handleApiError(error, "GET /api/user/security");
  }
}
