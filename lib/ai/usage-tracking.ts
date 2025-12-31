export interface UsageRequest {
  userId: string;
  usageType: 'transcription' | 'scoring' | 'feedback' | 'realtime_voice' | 'text_generation' | 'other';
  provider: string;
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  audioSeconds?: number;
  cost?: number;
  sessionId?: string;
  attemptId?: string;
  attemptType?: string;
  pteAttemptId?: string;
  metadata?: Record<string, any>;
}

export interface UsageResult {
  success: boolean;
  usageId?: string;
  error?: string;
}

// Mock implementation for now - in production this would save to database
export async function trackUsage(request: UsageRequest): Promise<UsageResult> {
  try {
    console.log('📊 Tracking AI Usage:', {
      userId: request.userId,
      usageType: request.usageType,
      provider: request.provider,
      model: request.model,
      totalTokens: request.totalTokens,
      cost: request.cost,
      timestamp: new Date().toISOString()
    });

    // In production, this would save to the ai_credit_usage table
    // For now, we'll just log it and return success
    return {
      success: true,
      usageId: `usage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  } catch (error) {
    console.error('❌ Usage tracking failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function getUserUsageStats(userId: string, period: 'day' | 'week' | 'month' = 'month'): Promise<{
  totalCost: number;
  totalTokens: number;
  usageByType: Record<string, number>;
}> {
  // Mock implementation - in production this would query the database
  return {
    totalCost: 0.05,
    totalTokens: 15000,
    usageByType: {
      'scoring': 0.03,
      'transcription': 0.02,
      'feedback': 0.00
    }
  };
}

export function estimateGeminiCost(inputTokens: number, outputTokens: number, model: string = 'gemini-2.5-pro'): number {
  // Gemini pricing (approximate)
  const pricing = {
    'gemini-2.5-pro': { input: 0.000125, output: 0.000375 }, // per 1K tokens
    'gemini-2.5-flash': { input: 0.000015, output: 0.00005 },
    'gemini-3-pro-preview': { input: 0.00025, output: 0.0005 }
  };

  const modelPricing = pricing[model as keyof typeof pricing] || pricing['gemini-2.5-pro'];
  
  return (inputTokens / 1000) * modelPricing.input + (outputTokens / 1000) * modelPricing.output;
}

export function estimateAudioCost(seconds: number): number {
  // Audio processing cost (approximate)
  return (seconds / 60) * 0.006; // $0.006 per minute
}