import React from 'react'
import { QuestionType, AnswerData } from '@/lib/types'
import MultipleChoice from './MultipleChoice'
import ReorderParagraphs from './ReorderParagraphsComponent'
import FillBlanksDragDrop from './FillBlanksDragDrop'
import FillBlanksDropdown from './FillBlanksDropdown'

interface ReadingInputProps {
    questionType: string
    question: {
        id: string
        title?: string | null
        promptText?: string | null
        options?: any
        // Add other fields as they come from the API/DB
        paragraphs?: string[] // For reorder
        textWithBlanks?: string // For FIB
    }
    value: AnswerData | null
    onChange: (value: AnswerData) => void
}

export default function ReadingInput({
    questionType,
    question,
    value,
    onChange,
}: ReadingInputProps) {
    // Normalize type string to be safe (backend might send enum values)
    const type = questionType as QuestionType

    switch (type) {
        case QuestionType.MULTIPLE_CHOICE_SINGLE:
        case QuestionType.MULTIPLE_CHOICE_MULTIPLE:
            return (
                <MultipleChoice
                    type={type}
                    options={question.options}
                    value={value}
                    onChange={onChange}
                />
            )

        case QuestionType.REORDER_PARAGRAPHS:
            return (
                <ReorderParagraphs
                    paragraphs={question.paragraphs || []}
                    value={value?.orderedParagraphs || null}
                    onChange={(val: string[]) => onChange({ ...value, orderedParagraphs: val })}
                />
            )

        case QuestionType.READING_BLANKS: // Drag and Drop
            return (
                <FillBlanksDragDrop
                    text={question.promptText || ''}
                    options={question.options}
                    value={value?.filledBlanks || null}
                    onChange={(val: { [key: string]: string }) =>
                        onChange({ ...value, filledBlanks: val })
                    }
                />
            )

        case QuestionType.READING_WRITING_BLANKS: // Dropdown
            return (
                <FillBlanksDropdown
                    text={question.promptText || ''}
                    options={question.options}
                    value={value?.filledBlanks || null}
                    onChange={(val: { [key: string]: string }) =>
                        onChange({ ...value, filledBlanks: val })
                    }
                />
            )

        default:
            return (
                <div className="p-4 rounded bg-yellow-50 text-yellow-800 border border-yellow-200">
                    <p className="font-semibold">Unknown Question Type: {questionType}</p>
                    <pre className="mt-2 text-xs overflow-auto">
                        {JSON.stringify(question, null, 2)}
                    </pre>
                </div>
            )
    }
}
