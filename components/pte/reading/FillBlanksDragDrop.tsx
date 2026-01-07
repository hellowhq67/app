import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

// Since we don't have dnd-kit installed and want to keep deps low,
// we'll implement a simple click-to-fill or native drag-drop if possible.
// Actually, for better accessibility and simplicity without massive boilerplates,
// a "Click slot -> Click word" or "Drag word -> Drop on slot" hybrid is good.
// Let's do a simple "Click word in bank to move to first empty slot, Click filled slot to return word to bank" approach first,
// which is very fast to interact with.

interface FillBlanksDragDropProps {
  text: string
  options: string[] | undefined
  value: { [key: string]: string } | null // Map of slot index -> word
  onChange: (val: { [key: string]: string }) => void
}

export default function FillBlanksDragDrop({ text, options = [], value, onChange }: FillBlanksDragDropProps) {
  // Current state of assignments
  // value is { "0": "word", "1": "word" }
  const assignments = value || {}

  // Parse text to find blanks. Usually represented as underscores _____ or [gap] or similar.
  // We need a robust parser.
  // Assumption: The text comes with some placeholder.
  // Standardizing on `_` (underscores) for detection.

  // Let's assume the text is split-able by standard regex for now.
  // Or maybe it's pre-segmented?
  // If text contains "____", we replace with indexed slots.

  const parts = text.split(/(_+)/g)
  let slotIndex = 0

  // Computed available options (all options minus used ones)
  // Note: PTE specific - sometimes options can be used multiple times? Usually distinct pool.
  // We'll assume distinct pool - once used, it's removed from bank.

  const usedWords = Object.values(assignments)
  const availableOptions = options.filter(opt => !usedWords.includes(opt))

  const handleSlotClick = (index: number) => {
    // If slot has a value, return it to pool
    const currentVal = assignments[index]
    if (currentVal) {
      const newAssignments = { ...assignments }
      delete newAssignments[index]
      onChange(newAssignments)
    }
  }

  const handleOptionClick = (word: string) => {
    // Find first empty slot
    const totalSlots = (text.match(/(_+)/g) || []).length
    let firstEmpty = -1
    for (let i = 0; i < totalSlots; i++) {
      if (!assignments[i]) {
        firstEmpty = i
        break
      }
    }

    if (firstEmpty !== -1) {
      onChange({
        ...assignments,
        [firstEmpty]: word
      })
    }
  }

  // Allow replacing a specific slot if we drag-dropped (complex to impement raw).
  // Stick to Click-to-Fill logic for now, it's very efficient.

  return (
    <div className="space-y-6">
      <div className="leading-loose text-lg font-medium p-4 border rounded-lg bg-card/50">
        {parts.map((part, i) => {
          if (part.match(/(_+)/)) {
            const currentIdx = slotIndex++
            const filledWord = assignments[currentIdx]

            return (
              <span
                key={i}
                onClick={() => handleSlotClick(currentIdx)}
                className={cn(
                  "inline-flex items-center justify-center min-w-[80px] h-8 mx-1 px-2 border-b-2 transition-colors cursor-pointer select-none",
                  filledWord 
                    ? "bg-primary/10 border-primary text-primary border-solid" 
                    : "bg-muted/50 border-muted-foreground/30 border-dashed hover:bg-muted"
                )}
              >
                {filledWord || <span className="text-transparent">gap</span>}
              </span>
            )
          }
          return <span key={i}>{part}</span>
        })}
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <p className="text-xs text-muted-foreground uppercase font-bold mb-3 tracking-wider">
          Word Bank (Click to fill)
        </p>
        <div className="flex flex-wrap gap-2">
          {availableOptions.map((opt, i) => (
            <button
              key={`${opt}-${i}`}
              onClick={() => handleOptionClick(opt)}
              className="bg-background hover:bg-accent border shadow-sm px-3 py-1.5 rounded-md text-sm font-medium transition-all active:scale-95"
            >
              {opt}
            </button>
          ))}
          {availableOptions.length === 0 && (
            <span className="text-sm text-muted-foreground italic">All words placed</span>
          )}
        </div>
      </div>
    </div>
  )
}
