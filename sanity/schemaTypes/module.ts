import { defineField, defineType } from 'sanity'

export const lmsModule = defineType({
    name: 'module',
    title: 'Module',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
        }),
        defineField({
            name: 'lessons',
            title: 'Lessons',
            type: 'array',
            of: [{ type: 'reference', to: { type: 'lesson' } }],
        }),
    ],
})
