import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { DndContext, DragOverlay, useDraggable, useDroppable, DragEndEvent, DragStartEvent } from '@dnd-kit/core';

interface FillBlanksDragDropProps {
  text: string;
  options: string[] | undefined;
  value: { [key: string]: string } | null;
  onChange: (val: { [key: string]: string }) => void;
}

function DraggableWord({ word, id, isDragging }: { word: string; id: string; isDragging?: boolean }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
    data: { word }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "bg-background hover:bg-accent border shadow-sm px-3 py-1.5 rounded-md text-sm font-medium cursor-grab active:cursor-grabbing inline-block m-1",
        isDragging && "opacity-50"
      )}
    >
      {word}
    </div>
  );
}

function DroppableSlot({ id, children, isOver }: { id: string; children?: React.ReactNode; isOver?: boolean }) {
  const { setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <span
      ref={setNodeRef}
      className={cn(
        "inline-flex items-center justify-center min-w-[80px] h-8 mx-1 px-2 border-b-2 transition-colors",
        isOver
          ? "bg-primary/20 border-primary"
          : children
            ? "bg-primary/10 border-primary border-solid"
            : "bg-muted/50 border-muted-foreground/30 border-dashed"
      )}
    >
      {children || <span className="text-transparent">gap</span>}
    </span>
  );
}

export default function FillBlanksDragDrop({ text, options = [], value, onChange }: FillBlanksDragDropProps) {
  const assignments = value || {};
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeWord, setActiveWord] = useState<string | null>(null);

  const parts = text.split(/(_+)/g);
  let slotIndex = 0;

  // Compute used words to filter bank
  const usedWords = Object.values(assignments);
  const availableOptions = options.map((opt, idx) => ({ word: opt, id: `bank-${opt}-${idx}` })).filter(opt => !usedWords.includes(opt.word));

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setActiveWord(event.active.data.current?.word as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveWord(null);

    const draggedWord = active.data.current?.word as string | undefined;
    if (!draggedWord) return;

    // Find which slot the dragged item came from (if any)
    // Draggables assigned to slots have id: `assigned-${slotIndex}`
    const sourceSlotKey = active.id.toString().startsWith('assigned-')
      ? active.id.toString().replace('assigned-', '')
      : null;

    if (!over) {
      // Dropped outside — if it was from a slot, return it to bank
      if (sourceSlotKey !== null) {
        const newAssignments = { ...assignments };
        delete newAssignments[sourceSlotKey];
        onChange(newAssignments);
      }
      return;
    }

    const overId = over.id as string;

    if (overId.startsWith('slot-')) {
      const targetSlotIndex = overId.replace('slot-', '');
      const newAssignments = { ...assignments };

      // Remove from source slot if dragged from one
      if (sourceSlotKey !== null) {
        delete newAssignments[sourceSlotKey];
      }

      // If target slot already has a word, swap it back to bank (by just overwriting)
      newAssignments[targetSlotIndex] = draggedWord;
      onChange(newAssignments);
    } else if (overId === 'bank-container') {
      // Dropped back to bank — remove from source slot
      if (sourceSlotKey !== null) {
        const newAssignments = { ...assignments };
        delete newAssignments[sourceSlotKey];
        onChange(newAssignments);
      }
    }
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-6 select-none">

        {/* Text Area */}
        <div className="leading-loose text-lg font-medium p-6 border rounded-lg bg-card/50 shadow-sm">
          {parts.map((part, i) => {
            if (part.match(/(_+)/)) {
              const currentIdx = slotIndex++;
              const filledWord = assignments[currentIdx.toString()];

              return (
                <DroppableSlot key={`slot-${currentIdx}`} id={`slot-${currentIdx}`}>
                  {filledWord ? (
                    <DraggableWord
                      word={filledWord}
                      id={`assigned-${currentIdx}`}
                    />
                  ) : null}
                </DroppableSlot>
              );
            }
            return <span key={i}>{part}</span>;
          })}
        </div>

        {/* Word Bank */}
        <div className="bg-muted p-6 rounded-lg min-h-[120px]">
          <p className="text-xs text-muted-foreground uppercase font-bold mb-3 tracking-wider">
            Drag words to fill gaps
          </p>
          <DroppableBank id="bank-container" className="flex flex-wrap gap-2">
            {availableOptions.map((opt) => (
              <DraggableWord key={opt.id} word={opt.word} id={opt.id} />
            ))}
            {availableOptions.length === 0 && Object.keys(assignments).length === options.length && (
              <span className="text-sm text-green-600 font-medium">All words placed</span>
            )}
            {availableOptions.length === 0 && Object.keys(assignments).length < options.length && (
              <span className="text-sm text-muted-foreground italic">Drag words back here to remove them</span>
            )}
          </DroppableBank>
        </div>

      </div>

      <DragOverlay>
        {activeId ? (
          <div className="bg-primary text-primary-foreground shadow-xl px-3 py-1.5 rounded-md text-sm font-bold opacity-90 scale-105 rotate-2 cursor-grabbing pointer-events-none border border-white/20">
            {activeWord}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// Helper for bank being droppable
function DroppableBank({ id, children, className }: { id: string; children: React.ReactNode; className?: string }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={cn(className, isOver && "bg-muted-foreground/10 rounded-lg transition-colors")}>
      {children}
    </div>
  );
}
