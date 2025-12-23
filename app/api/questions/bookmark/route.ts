import {
  apiSuccess,
  apiError,
  handleApiError,
  requireAuth,
} from "@/lib/api";
import { toggleQuestionBookmark } from "@/lib/db/queries";
import { z } from 'zod/v3';

const BookmarkSchema = z.object({
  questionId: z.string(),
  questionType: z.enum(["speaking", "writing", "reading", "listening"]),
  bookmarked: z.boolean(),
});

/**
 * POST /api/questions/bookmark
 * Toggles the bookmarked status of a question for the authenticated user.
 */
export async function POST(request: Request) {
  try {
    await requireAuth();

    const body = await request.json();
    const parsed = BookmarkSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(400, "Invalid request body: " + parsed.error.issues.map(i => i.message).join('; '), "BAD_REQUEST");
    }

    const { questionId, questionType, bookmarked } = parsed.data;

    const updated = await toggleQuestionBookmark({
      category: questionType,
      questionId,
      bookmarked,
    });

    if (!updated) {
      return apiError(404, "Question not found", "NOT_FOUND");
    }

    return apiSuccess({ success: true, updated });
  } catch (error) {
    return handleApiError(error, "POST /api/questions/bookmark");
  }
}
