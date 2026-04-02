import React, { useEffect, useState } from 'react'
import { Reorder, useDragControls } from 'framer-motion'
import { GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReorderParagraphsProps {
    paragraphs: string[]
    value: string[] | null // Array of paragraph strings in their new order
    onChange: (val: string[]) => void
}

export default function ReorderParagraphs({
    paragraphs,
    value,
    onChange,
}: ReorderParagraphsProps) {
    // We need to manage local state for the Reorder component
    const [items, setItems] = useState<{ id: string; text: string }[]>([])

    useEffect(() => {
        if (paragraphs.length === 0) return

        if (value && value.length === paragraphs.length) {
            // Reconstruct items from value using stable index-based IDs.
            // Track which original indices have been consumed to handle duplicate text.
            const availableIndices = new Map<string, number[]>()
            paragraphs.forEach((text, i) => {
                if (!availableIndices.has(text)) availableIndices.set(text, [])
                availableIndices.get(text)!.push(i)
            })
            const usedIndices = new Set<number>()
            const newItems = value.map((text) => {
                const pool = availableIndices.get(text) ?? []
                const idx = pool.find((i) => !usedIndices.has(i)) ?? pool[0] ?? 0
                usedIndices.add(idx)
                return { id: `para-${idx}`, text }
            })

            // Only update if the order actually changed to avoid infinite re-renders
            setItems((prev) => {
                const prevOrder = prev.map((it) => it.id).join(',')
                const nextOrder = newItems.map((it) => it.id).join(',')
                return prevOrder === nextOrder ? prev : newItems
            })
        } else {
            // Initialize with default order from props using index-based IDs
            const initialItems = paragraphs.map((text, i) => ({
                id: `para-${i}`,
                text,
            }))
            setItems(initialItems)
        }
    }, [paragraphs, value]) // Keep value in deps so external resets (e.g. "Clear" button) are respected

    const handleReorder = (newOrder: { id: string; text: string }[]) => {
        setItems(newOrder)
        onChange(newOrder.map((item) => item.text))
    }

    if (paragraphs.length === 0) {
        return <div>No paragraphs to reorder.</div>
    }

    return (
        <div className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
                Drag and drop the paragraphs to reorder them into a coherent text.
            </div>

            <div className="flex gap-4">
                {/* Source / Target split is common in PTE reorder, but simple vertical list is also acceptable for practice.
            PTE usually has "Source" on left and "Target" on right.
            For simplicity in this mobile-friendly responsive design, we'll use a single vertically sortable list. 
            If exact PTE replication is needed, we'd need two lists. We'll stick to single list for now for better UX on smaller screens.
        */}

                <Reorder.Group
                    axis="y"
                    values={items}
                    onReorder={handleReorder}
                    className="w-full space-y-3"
                >
                    {items.map((item) => (
                        <Reorder.Item
                            key={item.id}
                            value={item}
                            className="bg-card border rounded-md p-3 shadow-sm cursor-grab active:cursor-grabbing flex items-start gap-3 select-none"
                        >
                            <div className="mt-1 text-muted-foreground">
                                <GripVertical className="h-5 w-5" />
                            </div>
                            <p className="text-sm leading-relaxed">{item.text}</p>
                        </Reorder.Item>
                    ))}
                </Reorder.Group>
            </div>
        </div>
    )
}
