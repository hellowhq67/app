import { defineField, defineType } from 'sanity'

export const banner = defineType({
    name: 'banner',
    title: 'Banner',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
        }),
        defineField({
            name: 'content',
            title: 'Content',
            type: 'text',
        }),
        defineField({
            name: 'type',
            title: 'Type',
            type: 'string',
            options: {
                list: [
                    { title: 'Promotion', value: 'promotion' },
                    { title: 'Announcement', value: 'announcement' },
                    { title: 'Alert', value: 'alert' },
                ],
                layout: 'radio',
            },
        }),
        defineField({
            name: 'isActive',
            title: 'Is Active?',
            type: 'boolean',
            initialValue: true,
        }),
        defineField({
            name: 'link',
            title: 'Link',
            type: 'url',
        }),
    ],
})
