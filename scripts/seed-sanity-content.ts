
import { createClient } from 'next-sanity'
import * as dotenv from 'dotenv'
import { join } from 'path'

// Load environment variables from .env.local
dotenv.config({ path: join(process.cwd(), '.env.local') })

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const token = process.env.SANITY_API_TOKEN

if (!projectId || !dataset || !token) {
    console.error('Missing Sanity configuration. Please check your .env.local file.')
    process.exit(1)
}

const client = createClient({
    projectId,
    dataset,
    apiVersion: '2024-01-01',
    useCdn: false,
    token,
})

async function seed() {
    console.log('🌱 Starting Sanity content seeding...')

    // 1. Authors
    const authorDrH = await client.createOrReplace({
        _id: 'author-dr-h',
        _type: 'author',
        name: 'Dr. H',
        slug: { _type: 'slug', current: 'dr-h' },
        profession: 'PTE Expert & Lead Instructor'
    })
    console.log('✅ Author created: Dr. H')

    // 2. Categories
    const catPTE = await client.createOrReplace({
        _id: 'cat-pte-guide',
        _type: 'category',
        title: 'PTE Guide'
    })
    const catSpeaking = await client.createOrReplace({
        _id: 'cat-speaking',
        _type: 'category',
        title: 'Speaking'
    })
    console.log('✅ Categories created')

    // 3. Blog Posts
    // Free Post
    await client.createOrReplace({
        _id: 'post-pte-overview',
        _type: 'post',
        title: 'PTE Exam Overview 2024',
        slug: { _type: 'slug', current: 'pte-exam-overview-2024' },
        author: { _type: 'reference', _ref: authorDrH._id },
        categories: [{ _type: 'reference', _ref: catPTE._id }],
        publishedAt: new Date().toISOString(),
        isPaid: false,
        body: [
            {
                _type: 'block',
                children: [{ _type: 'span', text: 'The PTE Academic exam is a computer-based English language test...' }],
                markDefs: [],
                style: 'normal'
            }
        ]
    })

    // Paid Post
    await client.createOrReplace({
        _id: 'post-advanced-speaking',
        _type: 'post',
        title: 'Advanced Speaking Strategies',
        slug: { _type: 'slug', current: 'advanced-speaking-strategies' },
        author: { _type: 'reference', _ref: authorDrH._id },
        categories: [{ _type: 'reference', _ref: catSpeaking._id }],
        publishedAt: new Date().toISOString(),
        isPaid: true,
        body: [
            {
                _type: 'block',
                children: [{ _type: 'span', text: 'This is premium content for our subscribers. Learn how to score 90...' }],
                markDefs: [],
                style: 'normal'
            }
        ]
    })
    console.log('✅ Blog posts created')

    // 4. LMS Content
    // Lesson
    const lesson1 = await client.createOrReplace({
        _id: 'lesson-intro-pte',
        _type: 'lesson',
        title: 'Introduction to PTE',
        slug: { _type: 'slug', current: 'intro-to-pte' },
        duration: 15,
        isFree: true,
        content: [
            {
                _type: 'block',
                children: [{ _type: 'span', text: 'Welcome to the first lesson of the PTE Masterclass.' }],
                markDefs: [],
                style: 'normal'
            }
        ]
    })

    // Module
    const module1 = await client.createOrReplace({
        _id: 'module-getting-started',
        _type: 'lmsModule', // Note: using lmsModule as renamed
        title: 'Getting Started',
        description: 'Everything you need to know before starting your preparation.',
        lessons: [{ _type: 'reference', _ref: lesson1._id }]
    })

    // Course
    await client.createOrReplace({
        _id: 'course-pte-masterclass',
        _type: 'course',
        title: 'PTE Masterclass',
        slug: { _type: 'slug', current: 'pte-masterclass' },
        description: 'The ultimate guide to scoring 79+ in PTE Academic.',
        price: 99,
        isFree: false,
        modules: [{ _type: 'reference', _ref: module1._id }]
    })
    console.log('✅ LMS content created (Course, Module, Lesson)')

    // 5. Subscription Tiers
    await client.createOrReplace({
        _id: 'tier-pro',
        _type: 'subscriptionTier',
        title: 'Pro Access',
        price: 29,
        description: 'Access to all courses and premium blog posts.',
        features: ['Unlimited Practice', 'AI Scoring', 'Premium Video Courses'],
        isPopular: true,
        buttonText: 'Get Pro',
        buttonLink: 'https://pedagogistspte.com/pricing'
    })
    console.log('✅ Subscription Tier created')

    // 6. Banner
    await client.createOrReplace({
        _id: 'banner-launch-promo',
        _type: 'banner',
        title: 'Launch Promotion',
        content: 'Get 50% off for the first month! Use code LAUNCH50.',
        type: 'promotion',
        isActive: true,
        link: 'https://pedagogistspte.com/signup'
    })
    console.log('✅ Banner created')

    console.log('✨ Seeding completed successfully!')
}

seed().catch((err) => {
    console.error('Seeding failed:', err)
    process.exit(1)
})
