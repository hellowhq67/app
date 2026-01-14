import React from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface FillBlanksDropdownProps {
    text: string
    options: { [key: string]: string[] } | undefined // Map of slot index -> options array
    value: { [key: string]: string } | null
    onChange: (val: { [key: string]: string }) => void
}

export default function FillBlanksDropdown({
    text,
    options = {},
    value,
    onChange,
}: FillBlanksDropdownProps) {
    const assignments = value || {}

    // Parsing text for slots.
    // NOTE: For Dropdown FIB, question usually sends text with specific markers e.g. {1}, {2} or just sequential gaps.
    // We'll assume standard underscores `____` again or `_` sequences throughout the text.
    // But unlike DragDrop, each slot has its OWN specific set of options.
    // If `options` is an Array of strings, expected format might be flat or nested?
    // Usually for "Reading & Writing: Fill Blanks", it's a dropdown per slot.
    // The `options` prop here is typed as `{ [key: string]: string[] }` based on expected API shape for this question type.
    // i.e. "0": ["opt1", "opt2", ...], "1": ["optA", "optB"]

    const parts = text.split(/(_+)/g)
    let slotIndex = 0

    return (
        <div className="leading-loose text-lg font-medium p-4 border rounded-lg bg-card/50">
            {parts.map((part, i) => {
                if (part.match(/(_+)/)) {
                    const currentIdx = slotIndex++
                    const idxStr = currentIdx.toString()
                    const slotOptions = options[idxStr] || []
                    const currentVal = assignments[idxStr]

                    return (
                        <span key={i} className="inline-block mx-1 align-middle">
                            <Select
                                value={currentVal}
                                onValueChange={(val) =>
                                    onChange({ ...assignments, [idxStr]: val })
                                }
                            >
                                <SelectTrigger className="w-[140px] h-8 text-sm">
                                    <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {slotOptions.map((opt) => (
                                        <SelectItem key={opt} value={opt}>
                                            {opt}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </span>
                    )
                }
                return <span key={i}>{part}</span>
            })}
        </div>
    )
}
