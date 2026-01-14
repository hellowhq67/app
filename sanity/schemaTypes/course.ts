import { defineField, defineType } from 'sanity'

export const course = defineType({
    name: 'course',
    title: 'Course',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'title',
                maxLength: 96,
            },
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
        }),
        defineField({
            name: 'image',
            title: 'Course Image',
            type: 'image',
            options: {
                hotspot: true,
            },
        }),
        defineField({
            name: 'price',
            title: 'Price',
            type: 'number',
        }),
        defineField({
            name: 'isFree',
            title: 'Is Free?',
            type: 'boolean',
            initialValue: false,
        }),
        defineField({
            name: 'modules',
            title: 'Modules',
            type: 'array',
            of: [{ type: 'reference', to: { type: 'module' } }],
        }),
    ],
})
