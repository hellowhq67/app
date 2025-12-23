import { NextRequest, NextResponse } from "next/server";
import { getUserExamDates, createUserExamDate } from "@/lib/db/queries";

/**
 * Retrieve scheduled exam dates for the authenticated user.
 */
export async function GET(request: NextRequest) {
  try {
    const examDates = await getUserExamDates();
    return NextResponse.json({ examDates });
  } catch (error) {
    console.error("Error fetching exam dates:", error);
    return NextResponse.json(
      { error: "Failed to fetch exam dates" },
      { status: 500 }
    );
  }
}

/**
 * Create a new scheduled exam date for the authenticated user.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newExamDate = await createUserExamDate(body);

    return NextResponse.json({ success: true, examDate: newExamDate });
  } catch (error) {
    console.error("Error creating exam date:", error);
    const status = error instanceof Error && error.message === 'Unauthorized' ? 401 : 
                 error instanceof Error && error.message.includes('past') ? 400 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create exam date" },
      { status }
    );
  }
}
