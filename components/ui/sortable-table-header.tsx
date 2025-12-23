"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import Link from "next/link";

type SortableTableHeaderProps = {
  column: string;
  sortBy: string;
  sortOrder: string;
  children: React.ReactNode;
  section: string;
  questionType: string;
};

export function SortableTableHeader({
  column,
  sortBy,
  sortOrder,
  children,
  section,
  questionType,
}: SortableTableHeaderProps) {
  const isSorting = sortBy === column;
  const newSortOrder = isSorting && sortOrder === "asc" ? "desc" : "asc";
  const href = `/pte/academic/practice/${section}/${questionType}?sortBy=${column}&sortOrder=${newSortOrder}`;

  return (
    <Link href={href} className="flex items-center gap-2">
      {children}
      {isSorting &&
        (sortOrder === "asc" ? (
          <ArrowUp className="h-4 w-4" />
        ) : (
          <ArrowDown className="h-4 w-4" />
        ))}
    </Link>
  );
}
