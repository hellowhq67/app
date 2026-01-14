import { type SchemaTypeDefinition } from 'sanity'
import { blockContent } from './blockContent'
import { category } from './category'
import { post } from './post'
import { author } from './author'
import { testimonial } from './testimonial'

import { course } from './course'
import { lmsModule } from './module'
import { lesson } from './lesson'

import { subscriptionTier } from './subscriptionTier'
import { banner } from './banner'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [blockContent, category, post, author, testimonial, course, lmsModule, lesson, subscriptionTier, banner],
}
