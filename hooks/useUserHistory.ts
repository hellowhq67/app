import { useState, useEffect } from "react";

interface UserAttempt {
  questionId: string;
  testType: string;
  spokenText?: string;
  score?: any;
  durationSeconds?: number;
  timestamp: Date;
}

export function useUserHistory() {
  const [attempts, setAttempts] = useState<UserAttempt[]>([]);

  useEffect(() => {
    // Load attempts from localStorage or API
    const savedAttempts = localStorage.getItem("userAttempts");
    if (savedAttempts) {
      setAttempts(JSON.parse(savedAttempts, (key, value) => {
        if (key === "timestamp") return new Date(value);
        return value;
      }));
    }
  }, []);

  const saveAttempt = async (attempt: Omit<UserAttempt, "timestamp">) => {
    const newAttempt: UserAttempt = {
      ...attempt,
      timestamp: new Date(),
    };

    const updatedAttempts = [...attempts, newAttempt];
    setAttempts(updatedAttempts);
    
    // Save to localStorage
    localStorage.setItem("userAttempts", JSON.stringify(updatedAttempts));
    
    // In a real app, you would also save to your API/database
    try {
      await fetch("/api/user/attempts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAttempt),
      });
    } catch (error) {
      console.error("Failed to save attempt to server:", error);
    }
  };

  const getAttempts = (testType?: string) => {
    if (testType) {
      return attempts.filter(attempt => attempt.testType === testType);
    }
    return attempts;
  };

  const clearHistory = () => {
    setAttempts([]);
    localStorage.removeItem("userAttempts");
  };

  return {
    attempts,
    saveAttempt,
    getAttempts,
    clearHistory,
  };
}
