"use client";

import React from 'react';
import { ModernResultsScreen } from './ModernSectionalTestUI';
import { useRouter } from 'next/navigation';

interface ModernResultsViewProps {
    scores: {
        speaking: number;
        writing: number;
        reading: number;
        listening: number;
    };
    overallScore: number;
}

export default function ModernResultsView({ scores, overallScore }: ModernResultsViewProps) {
    const router = useRouter();

    return (
        <ModernResultsScreen
            scores={scores}
            overallScore={overallScore}
            onRestart={() => router.push('/academic/sectional-test')}
        />
    );
}
