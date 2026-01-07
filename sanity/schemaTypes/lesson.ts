import { defineField, defineType } from 'sanity'

export const lesson = defineType({
    name: 'lesson',
    title: 'Lesson',
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
            name: 'video',
            title: 'Video',
            type: 'mux.video',
            description: 'Upload video using Mux (removes need for external URL hosting)',
        }),
        defineField({
            name: 'videoUrl',
            title: 'Video URL (Legacy)',
            type: 'url',
            description: 'External video URL (e.g., YouTube, Vimeo) - Deprecated',
            hidden: true,
        }),
        defineField({
            name: 'videoFile',
            title: 'Video File (Legacy)',
            type: 'file',
            options: {
                accept: 'video/*',
            },
            description: 'Upload a video file directly - Deprecated',
            hidden: true,
        }),
        defineField({
            name: 'duration',
            title: 'Duration (minutes)',
            type: 'number',
        }),
        defineField({
            name: 'content',
            title: 'Content',
            type: 'blockContent',
        }),
        defineField({
            name: 'isFree',
            title: 'Is Free?',
            type: 'boolean',
            initialValue: false,
        }),
    ],
})
