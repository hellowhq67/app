import { benchmarkResponses } from '../data/benchmark-responses';
import * as fs from 'fs';
import * as path from 'path';

const OUTPUT_PATH = path.join(process.cwd(), 'data', 'pte-universal-dataset.csv');

function escapeCsv(field: string | number | undefined): string {
    if (field === undefined || field === null) return '';
    const stringField = String(field);
    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
}

async function generateCsv() {
    console.log(`🚀 Starting CSV generation for ${benchmarkResponses.length} benchmarks...`);

    const headers = [
        'id',
        'question_type',
        'response_text',
        'overall_score',
        'fluency_score',
        'pronunciation_score',
        'content_score',
        'vocabulary_score',
        'grammar_score'
    ];

    const rows = benchmarkResponses.map(b => {
        return [
            b.id,
            b.questionType,
            b.response,
            b.score,
            b.features.fluency,
            // Use pronunciation if available (speaking), otherwise empty or reuse fluency context if appropriate for type
            // The rubric shows 'Pronunciation' is specific to speaking.
            'pronunciation' in b.features ? b.features.pronunciation : '',
            b.features.content,
            b.features.vocabulary,
            b.features.grammar
        ].map(escapeCsv).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    fs.writeFileSync(OUTPUT_PATH, csvContent);
    console.log(`✅ CSV generated successfully at: ${OUTPUT_PATH}`);
    console.log(`📊 Total rows: ${rows.length}`);
}

generateCsv().catch(console.error);
