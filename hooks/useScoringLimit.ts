'use client';

import { useState, useEffect } from "react";
import { getMockTestAccess, incrementMockTestUsage } from "@/app/actions/mock-test-limits";

export function useScoringLimit() {
  const [remainingAttempts, setRemainingAttempts] = useState(5); // Default, updates after fetch
  const [canScore, setCanScore] = useState(true);
  const [tier, setTier] = useState('free');

  useEffect(() => {
    async function fetchLimit() {
      try {
        const access = await getMockTestAccess();
        setRemainingAttempts(access.remainingAttempts);
        setCanScore(access.canScore);
        setTier(access.tier);
      } catch (error) {
        console.error("Failed to fetch scoring limit:", error);
      }
    }
    fetchLimit();
  }, []);

  const incrementUsage = async (): Promise<boolean> => {
    // Optimistic update
    if (remainingAttempts <= 0 && tier === 'free') return false; // Enforce locally if possible

    const success = await incrementMockTestUsage();
    
    if (success) {
      setRemainingAttempts(prev => Math.max(0, prev - 1));
      if (remainingAttempts - 1 <= 0 && tier !== 'pro' && tier !== 'premium') {
        setCanScore(false);
      }
    } else {
      // Revert/Sync if failed
      const access = await getMockTestAccess();
      setRemainingAttempts(access.remainingAttempts);
      setCanScore(access.canScore);
    }
    
    return success;
  };

  const resetUsage = () => {
    // No-op or call server? Server handles daily reset.
    // Maybe force re-fetch
    window.location.reload();
  };

  return {
    remainingAttempts,
    canScore,
    incrementUsage,
    resetUsage,
  };
}
