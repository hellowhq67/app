'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { TypeQuestionList } from '../../_components/type-question-list';

export default function PteTypeQuestionListPage() {
    const { category, type } = useParams() as { category: string, type: string };

    return <TypeQuestionList category={category} type={type} />;
}