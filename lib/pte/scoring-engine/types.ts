import { QuestionType } from '@/lib/types';

export type SkillName = 'speaking' | 'writing' | 'reading' | 'listening';

export interface TraitWeights {
    content?: number;
    pronunciation?: number;
    fluency?: number;
    form?: number;
    grammar?: number;
    vocabulary?: number;
    spelling?: number;
    written_discourse?: number;
}

export interface TaskSkillContribution {
    speaking: number;
    writing: number;
    reading: number;
    listening: number;
}

export type ContributionMatrix = Record<QuestionType, TaskSkillContribution>;

export interface TraitScore {
    raw: number; // 0.0 - 1.0 (trait score)
    weight: number; // Weight in the task
}

export interface TaskScore {
    raw: number; // Sum of weighted trait scores
    contributions: Record<SkillName, number>;
}

export interface ScoringResult {
    overallScore: number;
    communicativeSkills: Record<SkillName, number>;
    detailedFeedback?: any;
}
