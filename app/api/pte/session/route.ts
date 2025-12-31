import { NextRequest, NextResponse } from 'next/server';
import {
  createPTESession,
  getPTESession,
  getUserSessions,
  updatePTESession
} from '@/lib/db/queries/pte-sessions';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Create new PTE session
    const session = await createPTESession(userId);

    return NextResponse.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error creating PTE session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');

    if (sessionId) {
      // Get specific session
      const session = await getPTESession(sessionId);

      if (!session) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: session
      });
    }

    if (userId) {
      // Get user sessions
      const sessions = await getUserSessions(userId);

      return NextResponse.json({
        success: true,
        data: sessions
      });
    }

    return NextResponse.json(
      { error: 'Session ID or User ID is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error getting PTE session:', error);
    return NextResponse.json(
      { error: 'Failed to get session' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { sessionId, updates } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const session = await updatePTESession(sessionId, updates);

    return NextResponse.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error updating PTE session:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}
