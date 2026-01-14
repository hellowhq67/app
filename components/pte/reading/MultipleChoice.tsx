import React from 'react'
import { QuestionType } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

interface MultipleChoiceProps {
    type: QuestionType
    options: string[] | undefined
    value: any // Kept as any internally or specific partial? Let's use string | number[]
    // Ideally: value: string | number[] | undefined
    onChange: (val: any) => void
}

export default function MultipleChoice({
    type,
    options = [],
    value,
    onChange,
}: MultipleChoiceProps) {
    const isMultiple = type === QuestionType.MULTIPLE_CHOICE_MULTIPLE

    // Value for multiple: string[] (ids or indices)
    // Value for single: string (id or index)

    // Normalize options to ensure they have IDs if possible, otherwise use index
    // Assuming options is string[] for now based on typical PTE input

    if (!options || options.length === 0) {
        return <div className="text-muted-foreground p-4">No options available.</div>
    }

    if (isMultiple) {
        const selected = (Array.isArray(value) ? value : []) as number[]

        const toggle = (index: number) => {
            if (selected.includes(index)) {
                onChange(selected.filter((i) => i !== index))
            } else {
                onChange([...selected, index].sort())
            }
        }

        return (
            <div className="space-y-3">
                {options.map((opt, idx) => (
                    <div
                        key={idx}
                        className={cn(
                            'flex items-start space-x-3 rounded-md border p-4 transition-colors hover:bg-muted/50',
                            selected.includes(idx) ? 'border-primary bg-primary/5' : ''
                        )}
                    >
                        <Checkbox
                            id={`opt-${idx}`}
                            checked={selected.includes(idx)}
                            onChange={() => toggle(idx)}
                        />
                        <label
                            htmlFor={`opt-${idx}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer w-full"
                        >
                            {opt}
                        </label>
                    </div>
                ))}
            </div>
        )
    }

    // Single Choice
    return (
        <RadioGroup
            value={value?.toString()}
            onValueChange={(val) => onChange(parseInt(val))}
            className="space-y-3"
        >
            {options.map((opt, idx) => (
                <div
                    key={idx}
                    className={cn(
                        'flex items-center space-x-3 rounded-md border p-4 transition-colors hover:bg-muted/50',
                        value === idx ? 'border-primary bg-primary/5' : ''
                    )}
                >
                    <RadioGroupItem value={idx.toString()} id={`opt-${idx}`} />
                    <Label htmlFor={`opt-${idx}`} className="cursor-pointer w-full">
                        {opt}
                    </Label>
                </div>
            ))}
        </RadioGroup>
    )
}
