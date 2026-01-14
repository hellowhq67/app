import { getUserDeviceSessions, deleteAllUserSessions } from "@/lib/db/queries";
import { apiSuccess, handleApiError, apiError, requireAuth } from "@/lib/api";

export async function GET() {
  try {
    const { userId } = await requireAuth();
    const sessions = await getUserDeviceSessions(userId);
    return apiSuccess(sessions);
  } catch (error) {
    return handleApiError(error, "GET /api/user/sessions");
  }
}
