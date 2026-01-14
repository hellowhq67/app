import { deleteAllUserSessions } from "@/lib/db/queries";
import { apiSuccess, handleApiError, requireAuth } from "@/lib/api";

export async function POST() {
  try {
    const { userId } = await requireAuth();
    await deleteAllUserSessions(userId);
    return apiSuccess({
      success: true,
      message: "All sessions signed out successfully",
    });
  } catch (error) {
    return handleApiError(error, "POST /api/user/signout-all");
  }
}
