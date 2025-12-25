import { db } from '@/lib/db/drizzle';
import { pteCategories, pteQuestionTypes } from '@/lib/db/schema/pte-categories';
import { apiSuccess, handleApiError } from '@/lib/api';

export async function GET() {
  try {
    const categories = await db.query.pteCategories.findMany({
      with: {
        questionTypes: true,
      },
      orderBy: (categories, { asc }) => [asc(categories.displayOrder)],
    });

    return apiSuccess(categories);
  } catch (error) {
    return handleApiError(error, 'GET /api/pte/categories');
  }
}
