import { db } from '@/lib/db/drizzle';
import {
    pteQuestions,
    pteSpeakingQuestions,
    pteWritingQuestions,
    pteReadingQuestions,
    pteListeningQuestions,
    pteQuestionTypes,
} from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { QuestionType, TestSection } from '@/lib/types';

/**
 * Fetch questions by section and optional type
 */
export async function getPteQuestions(
    section: TestSection,
    type?: QuestionType,
    limit: number = 20
) {
    switch (section) {
        case TestSection.SPEAKING:
            return getSpeakingQuestions(type, limit);
        case TestSection.WRITING:
            return getWritingQuestions(type, limit);
        case TestSection.READING:
            return getReadingQuestions(type, limit);
        case TestSection.LISTENING:
            return getListeningQuestions(type, limit);
        default:
            return [];
    }
}

async function getSpeakingQuestions(type?: QuestionType, limit: number = 20) {
    const query = db
        .select({
            id: pteQuestions.id,
            title: pteQuestions.title,
            content: pteQuestions.content,
            typeId: pteQuestions.questionTypeId,
            typeName: pteQuestionTypes.name,
            code: pteQuestionTypes.code,
            audioPromptUrl: pteSpeakingQuestions.audioPromptUrl,
            expectedDuration: pteSpeakingQuestions.expectedDuration,
        })
        .from(pteQuestions)
        .innerJoin(pteQuestionTypes, eq(pteQuestions.questionTypeId, pteQuestionTypes.id))
        .innerJoin(pteSpeakingQuestions, eq(pteQuestions.id, pteSpeakingQuestions.questionId))
        .where(
            type
                ? eq(pteQuestionTypes.code, type as any)
                : inArray(pteQuestionTypes.code, [
                    'read_aloud', 'repeat_sentence', 'describe_image',
                    'retell_lecture', 'answer_short_question', 'respond_to_situation',
                    'summarize_group_discussion'
                ])
        )
        .limit(limit);

    return await query;
}

async function getWritingQuestions(type?: QuestionType, limit: number = 20) {
    const query = db
        .select({
            id: pteQuestions.id,
            title: pteQuestions.title,
            content: pteQuestions.content,
            typeId: pteQuestions.questionTypeId,
            typeName: pteQuestionTypes.name,
            code: pteQuestionTypes.code,
            promptText: pteWritingQuestions.promptText,
            wordCountMin: pteWritingQuestions.wordCountMin,
            wordCountMax: pteWritingQuestions.wordCountMax,
        })
        .from(pteQuestions)
        .innerJoin(pteQuestionTypes, eq(pteQuestions.questionTypeId, pteQuestionTypes.id))
        .innerJoin(pteWritingQuestions, eq(pteQuestions.id, pteWritingQuestions.questionId))
        .where(
            type
                ? eq(pteQuestionTypes.code, type as any)
                : inArray(pteQuestionTypes.code, ['summarize_written_text', 'essay'])
        )
        .limit(limit);

    return await query;
}

async function getReadingQuestions(type?: QuestionType, limit: number = 20) {
    const query = db
        .select({
            id: pteQuestions.id,
            title: pteQuestions.title,
            content: pteQuestions.content,
            typeId: pteQuestions.questionTypeId,
            typeName: pteQuestionTypes.name,
            code: pteQuestionTypes.code,
            passageText: pteReadingQuestions.passageText,
            options: pteReadingQuestions.options,
        })
        .from(pteQuestions)
        .innerJoin(pteQuestionTypes, eq(pteQuestions.questionTypeId, pteQuestionTypes.id))
        .innerJoin(pteReadingQuestions, eq(pteQuestions.id, pteReadingQuestions.questionId))
        .where(
            type
                ? eq(pteQuestionTypes.code, type as any)
                : inArray(pteQuestionTypes.code, [
                    'reading_mc_single', 'reading_mc_multiple', 'reorder_paragraphs',
                    'reading_fill_blanks_dropdown', 'reading_fill_blanks_drag'
                ])
        )
        .limit(limit);

    return await query;
}

async function getListeningQuestions(type?: QuestionType, limit: number = 20) {
    const query = db
        .select({
            id: pteQuestions.id,
            title: pteQuestions.title,
            content: pteQuestions.content,
            typeId: pteQuestions.questionTypeId,
            typeName: pteQuestionTypes.name,
            code: pteQuestionTypes.code,
            audioFileUrl: pteListeningQuestions.audioFileUrl,
            transcript: pteListeningQuestions.transcript,
            options: pteListeningQuestions.options,
        })
        .from(pteQuestions)
        .innerJoin(pteQuestionTypes, eq(pteQuestions.questionTypeId, pteQuestionTypes.id))
        .innerJoin(pteListeningQuestions, eq(pteQuestions.id, pteListeningQuestions.questionId))
        .where(
            type
                ? eq(pteQuestionTypes.code, type as any)
                : inArray(pteQuestionTypes.code, [
                    'summarize_spoken_text', 'listening_mc_multiple', 'listening_fill_blanks',
                    'highlight_correct_summary', 'listening_mc_single', 'select_missing_word',
                    'highlight_incorrect_words', 'write_from_dictation'
                ])
        )
        .limit(limit);

    return await query;
}
