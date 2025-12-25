'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { UniversalPracticeWrapper } from '../../_components/universal-practice-wrapper';

// Handlers from _components
import { SpeakingHandler } from '../../_components/speaking-handler';
import { WritingHandler } from '../../_components/writing-handler';
import { ReadingHandler } from '../../_components/reading-handler';
import { ListeningHandler } from '../../_components/listening-handler';

export default function PteQuestionPracticePage() {
    const { category, type } = useParams() as { category: string, type: string };

    return (
        <UniversalPracticeWrapper category={category} type={type}>
            {({ question, isSubmitting, onComplete, status, timer }) => {
                switch (category) {
                    case 'speaking':
                        return (
                            <SpeakingHandler
                                question={question}
                                onComplete={onComplete}
                                isSubmitting={isSubmitting}
                                status={status}
                                timer={timer}
                            />
                        );
                    case 'writing':
                        return (
                            <WritingHandler
                                question={question}
                                onComplete={onComplete}
                                isSubmitting={isSubmitting}
                                status={status}
                                timer={timer}
                            />
                        );
                    case 'reading':
                        return (
                            <ReadingHandler
                                question={question}
                                onComplete={onComplete}
                                isSubmitting={isSubmitting}
                                status={status}
                                timer={timer}
                            />
                        );
                    case 'listening':
                        return (
                            <ListeningHandler
                                question={question}
                                onComplete={onComplete}
                                isSubmitting={isSubmitting}
                                status={status}
                                timer={timer}
                            />
                        );
                    default:
                        return <div>Invalid Category</div>;
                }
            }}
        </UniversalPracticeWrapper>
    );
}

