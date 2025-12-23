import { db } from '../drizzle'
import {
    pteTests,
    speakingQuestions,
    writingQuestions,
    readingQuestions,
    listeningQuestions,
    speakingAttempts,
    pteQuestionTypes,
    pteQuestions
} from '../schema'
import { eq, and, sql, desc, asc, getTableColumns } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

/**
 * Retrieve all PTE question categories/types.
 */
export async function getPteCategories() {
    try {
        return await db.select().from(pteQuestionTypes).orderBy(asc(pteQuestionTypes.id))
    } catch (error) {
        console.error('Error in getPteCategories query:', error)
        return []
    }
}

/**
 * Retrieve all PTE tests from the database.
 */
export async function getTests() {
    try {
        return await db.select().from(pteTests)
    } catch (error) {
        console.error('Error in getTests query:', error)
        return []
    }
}

/**
 * Retrieve questions based on category and optional filters.
 */
export async function getQuestions(options: {
    category: 'speaking' | 'reading' | 'writing' | 'listening'
    userId?: string
    type?: string
    page?: number
    limit?: number
    difficulty?: string
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}) {
    const { category, userId, type, page = 1, limit = 20, difficulty, search, sortBy = 'createdAt', sortOrder = 'desc' } = options
    const offset = (page - 1) * limit

    let table: any
    let attemptsTable: any
    if (category === 'speaking') {
        table = speakingQuestions
        attemptsTable = speakingAttempts
    } else if (category === 'reading') {
        table = readingQuestions
    } else if (category === 'writing') {
        table = writingQuestions
    } else if (category === 'listening') {
        table = listeningQuestions
    } else throw new Error('Invalid category')

    const conditions: any[] = []
    if (type) conditions.push(eq(table.type, type as any))
    if (difficulty && difficulty !== 'All') conditions.push(eq(table.difficulty, difficulty as any))
    if (search) {
        const pattern = `%${search}%`
        conditions.push(sql`(${table.title} ILIKE ${pattern} OR ${table.promptText} ILIKE ${pattern})`)
    }
    conditions.push(eq(table.isActive, true))

    const whereClauses = and(...conditions)

    const [{ count }] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(table)
        .where(whereClauses)

    // Build select object
    const selectFields: any = {
        ...getTableColumns(table),
    }

    if (userId && attemptsTable) {
        selectFields.practicedCount = sql<number>`(
            SELECT count(*) 
            FROM ${attemptsTable} 
            WHERE ${attemptsTable.questionId} = ${table.id} 
            AND ${attemptsTable.userId} = ${userId}
        )`.mapWith(Number)
    }

    const rows = await db
        .select(selectFields)
        .from(table)
        .where(whereClauses)
        .limit(limit)
        .offset(offset)
        .orderBy(sortOrder === 'desc' ? desc(table[sortBy as any || 'createdAt']) : asc(table[sortBy as any || 'createdAt']))

    return { data: rows, total: Number(count), limit }
}

/**
 * Retrieve a single question by ID and category.
 */
export async function getQuestionById(options: { id: string; category: 'speaking' | 'reading' | 'writing' | 'listening' }) {
    const { id, category } = options

    if (category === 'speaking') {
        return await db.query.speakingQuestions.findFirst({
            where: eq(speakingQuestions.id, id)
        })
    }
    if (category === 'reading') {
        return await db.query.readingQuestions.findFirst({
            where: eq(readingQuestions.id, id)
        })
    }
    if (category === 'writing') {
        return await db.query.writingQuestions.findFirst({
            where: eq(writingQuestions.id, id)
        })
    }
    if (category === 'listening') {
        return await db.query.listeningQuestions.findFirst({
            where: eq(listeningQuestions.id, id)
        })
    }
    
    return null
}

/**
 * Toggle the bookmarked status of a question.
 */
export async function toggleQuestionBookmark(options: {
    category: 'speaking' | 'reading' | 'writing' | 'listening'
    questionId: string
    bookmarked: boolean
}) {
    const { category, questionId, bookmarked } = options
    let table: any
    if (category === 'speaking') table = speakingQuestions
    else if (category === 'reading') table = readingQuestions
    else if (category === 'writing') table = writingQuestions
    else if (category === 'listening') table = listeningQuestions
    else throw new Error('Invalid category')

    const [updated] = await db
        .update(table)
        .set({ bookmarked })
        .where(eq(table.id, questionId))
        .returning()

    return updated
}

/**
 * Create a new question or return existing if title/type match.
 */
export async function createQuestion(options: {
    category: 'speaking' | 'reading' | 'writing' | 'listening'
    data: any
}) {
    const { category, data } = options
    let table: any
    if (category === 'speaking') table = speakingQuestions
    else if (category === 'reading') table = readingQuestions
    else if (category === 'writing') table = writingQuestions
    else if (category === 'listening') table = listeningQuestions
    else throw new Error('Invalid category')

    return await db.transaction(async (tx) => {
        const existing = await tx
            .select({ id: table.id })
            .from(table)
            .where(
                and(eq(table.type, data.type), eq(table.title, data.title))
            )
            .limit(1)

        if (existing.length > 0) {
            return { id: existing[0].id, created: false }
        }

        const [row] = await tx
            .insert(table)
            .values({
                ...data,
                createdAt: new Date(),
            })
            .returning()

        return { id: row.id, created: true }
    })
}

/**
 * Retrieve unified questions from pte_questions table.
 */
export async function getUnifiedQuestions(options: {
    section?: string
    type?: string
    difficulty?: string
    search?: string
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}) {
    const { section, type, difficulty, search, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = options
    const offset = (page - 1) * limit

    const conditions: any[] = []
    if (section) conditions.push(eq(pteQuestions.section, section))
    if (type) conditions.push(eq(pteQuestions.questionType, type))
    if (difficulty) conditions.push(eq(pteQuestions.difficulty, difficulty))
    if (search) {
        const pattern = `%${search}%`
        conditions.push(sql`(${pteQuestions.question} ILIKE ${pattern} OR CAST(${pteQuestions.questionData} AS TEXT) ILIKE ${pattern})`)
    }

    const whereExpr = conditions.length ? and(...conditions) : undefined

    const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(pteQuestions)
        .where(whereExpr)

    const rows = await db
        .select()
        .from(pteQuestions)
        .where(whereExpr)
        .orderBy(sortOrder === 'desc' ? desc(pteQuestions[sortBy as any || 'createdAt']) : asc(pteQuestions[sortBy as any || 'createdAt']))
        .limit(limit)
        .offset(offset)

    return { items: rows, total: Number(count), page, pageSize: limit }
}

/**
 * Create a unified question in pte_questions table.
 */
export async function createUnifiedQuestion(data: any) {
    const [created] = await db
        .insert(pteQuestions)
        .values({
            ...data,
            createdAt: new Date(),
        })
        .returning()
    return created
}

/**
 * Retrieve previous and next question IDs for navigation.
 */
export async function getQuestionNavigation(options: {
    category: 'speaking' | 'reading' | 'writing' | 'listening'
    currentId: string
    type: string
    createdAt: Date
}) {
    const { category, currentId, type, createdAt } = options
    let table: any
    if (category === 'speaking') table = speakingQuestions
    else if (category === 'reading') table = readingQuestions
    else if (category === 'writing') table = writingQuestions
    else if (category === 'listening') table = listeningQuestions
    else throw new Error('Invalid category')

    const createdAtStr = createdAt instanceof Date ? createdAt.toISOString() : createdAt

    const [prevRow] = await db
        .select({ id: table.id })
        .from(table)
        .where(
            and(
                eq(table.type, type),
                sql`(${table.createdAt} < ${createdAtStr} OR (${table.createdAt} = ${createdAtStr} AND ${table.id} < ${currentId}))`
            )
        )
        .orderBy(desc(table.createdAt), desc(table.id))
        .limit(1)

    const [nextRow] = await db
        .select({ id: table.id })
        .from(table)
        .where(
            and(
                eq(table.type, type),
                sql`(${table.createdAt} > ${createdAtStr} OR (${table.createdAt} = ${createdAtStr} AND ${table.id} > ${currentId}))`
            )
        )
        .orderBy(asc(table.createdAt), asc(table.id))
        .limit(1)

    return {
        prevId: prevRow?.id || null,
        nextId: nextRow?.id || null,
    }
}
