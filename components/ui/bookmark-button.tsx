"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type BookmarkButtonProps = {
  questionId: string;
  questionType: string;
  bookmarked: boolean;
};

export function BookmarkButton({
  questionId,
  questionType,
  bookmarked,
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(bookmarked);
  const [isPending, setIsPending] = useState(false);

  const handleClick = async () => {
    setIsPending(true);
    try {
      const response = await fetch("/api/questions/bookmark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionId,
          questionType,
          bookmarked: !isBookmarked,
        }),
      });

      if (response.ok) {
        setIsBookmarked(!isBookmarked);
      }
    } catch (error) {
      console.error("Error bookmarking question:", error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button onClick={handleClick} disabled={isPending}>
      <Star
        className={cn(
          "h-5 w-5",
          isBookmarked ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
        )}
      />
    </button>
  );
}
