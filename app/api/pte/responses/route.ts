import { NextRequest, NextResponse } from 'next/server';
import { savePTEResponse, getPTEResponses, updatePTEResponse } from '@/lib/db/queries/pte-sessions';

export async function POST(request: NextRequest) {
  try {
    const response = await request.json();

    // Validate required fields
    if (!response.sessionId || !response.questionId || !response.answer) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, questionId, answer' },
        { status: 400 }
      );
    }

    // Save response
    const savedResponse = await savePTEResponse({
      sessionId: response.sessionId, // Updated to camelCase for Drizzle
      questionId: response.questionId,
      questionType: response.questionType,
      answer: response.answer,
      timeSpent: response.timeSpent,
      timestamp: new Date(), // Drizzle expects Date object usually, or string if configured. Schema says timestamp().
      aiScore: response.aiScore,
      aiFeedback: response.aiFeedback
    });

    return NextResponse.json({
      success: true,
      data: savedResponse
    });
  } catch (error) {
    console.error('Error saving PTE response:', error);
    return NextResponse.json(
      { error: 'Failed to save response' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const responses = await getPTEResponses(sessionId);

    return NextResponse.json({
      success: true,
      data: responses
    });
  } catch (error) {
    console.error('Error getting PTE responses:', error);
    return NextResponse.json(
      { error: 'Failed to get responses' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { responseId, updates } = await request.json();

    if (!responseId) {
      return NextResponse.json(
        { error: 'Response ID is required' },
        { status: 400 }
      );
    }

    const response = await updatePTEResponse(responseId, updates);

    return NextResponse.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error updating PTE response:', error);
    return NextResponse.json(
      { error: 'Failed to update response' },
      { status: 500 }
    );
  }
}
