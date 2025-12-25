'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WritingPracticeProps {
    question: any;
    onComplete: (data: { text: string; wordCount: number }) => void;
}

export function WritingPractice({ question, onComplete }: WritingPracticeProps) {
    const [text, setText] = useState('');
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    const minWords = question.writingQuestions?.wordCountMin || 5;
    const maxWords = question.writingQuestions?.wordCountMax || 75;

    const isInvalid = wordCount < minWords || wordCount > maxWords;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur opacity-0 group-focus-within:opacity-100 transition duration-1000"></div>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Start typing your response here..."
                    className="relative w-full h-80 bg-black/40 border border-white/10 rounded-3xl p-8 text-white text-lg focus:outline-none focus:border-blue-500/50 transition-all resize-none custom-scrollbar shadow-2xl leading-relaxed"
                />
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-6 p-6 bg-white/[0.03] border border-white/10 rounded-3xl shadow-xl">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className={`size-10 rounded-xl flex items-center justify-center border ${isInvalid ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                            <Type className="size-5" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Word Count</p>
                            <p className={`text-xl font-mono font-bold ${isInvalid ? 'text-red-400' : 'text-emerald-400'}`}>
                                {wordCount}
                            </p>
                        </div>
                    </div>

                    <div className="hidden md:block h-10 w-px bg-white/5" />

                    <div className="text-sm text-gray-500">
                        <p>Requirement: <span className="font-bold text-gray-300">{minWords} - {maxWords}</span> words</p>
                        {wordCount > 0 && isInvalid && (
                            <p className="text-red-400/80 text-[11px] flex items-center gap-1 mt-1">
                                <AlertCircle className="size-3" />
                                {wordCount < minWords ? 'Too short' : 'Exceeds maximum limit'}
                            </p>
                        )}
                    </div>
                </div>

                <Button
                    onClick={() => onComplete({ text, wordCount })}
                    disabled={!text.trim() || isInvalid}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 px-12 rounded-2xl transition-all shadow-lg shadow-blue-600/30 flex items-center gap-3 active:scale-95 disabled:opacity-30"
                >
                    Submit Response
                    <CheckCircle className="size-5" />
                </Button>
            </div>
        </div>
    );
}
