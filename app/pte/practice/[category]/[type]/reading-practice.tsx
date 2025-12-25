'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReadingPracticeProps {
    question: any;
    onComplete: (data: { selectedIndices: number[] }) => void;
}

export function ReadingPractice({ question, onComplete }: ReadingPracticeProps) {
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
    const isMultiple = question.questionType?.code?.includes('multiple') || false;
    const options = question.readingQuestions?.options?.choices || [];

    const toggleOption = (idx: number) => {
        if (isMultiple) {
            setSelectedIndices(prev =>
                prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
            );
        } else {
            setSelectedIndices([idx]);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 gap-4">
                {options.map((option: string, idx: number) => (
                    <button
                        key={idx}
                        onClick={() => toggleOption(idx)}
                        className={`flex items-center gap-6 p-6 rounded-3xl border transition-all text-left group ${selectedIndices.includes(idx)
                                ? 'bg-blue-600/10 border-blue-500 ring-2 ring-blue-500/20'
                                : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20 shadow-lg shadow-black/20'
                            }`}
                    >
                        <div className={`size-8 rounded-xl flex items-center justify-center border font-bold text-sm transition-all ${selectedIndices.includes(idx)
                                ? 'bg-blue-600 border-blue-400 text-white'
                                : 'bg-white/5 border-white/10 text-gray-500 group-hover:border-white/30'
                            }`}>
                            {String.fromCharCode(65 + idx)}
                        </div>
                        <span className={`text-lg transition-colors flex-1 ${selectedIndices.includes(idx) ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                            {option}
                        </span>
                        <div className={`size-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedIndices.includes(idx)
                                ? 'bg-blue-500 border-blue-400'
                                : 'border-white/5 opacity-0 group-hover:opacity-100'
                            }`}>
                            {selectedIndices.includes(idx) && <CheckCircle className="size-4 text-white" />}
                        </div>
                    </button>
                ))}
            </div>

            <div className="flex justify-end pt-6">
                <Button
                    onClick={() => onComplete({ selectedIndices })}
                    disabled={selectedIndices.length === 0}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 px-12 rounded-2xl transition-all shadow-lg shadow-blue-600/30 flex items-center gap-3 active:scale-95 disabled:opacity-30"
                >
                    Finalize Answer
                    <ArrowRight className="size-5" />
                </Button>
            </div>
        </div>
    );
}
