import type { StructureResolver } from 'sanity/structure'
import {
  BookIcon,
  UsersIcon,
  TagIcon,
  StarIcon,
  ImageIcon,
  CogIcon,
  HomeIcon,
  DocumentTextIcon,
  ListIcon,
  PresentationIcon
} from '@sanity/icons'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('PTE Content Studio')
    .items([
      // LMS Section
      S.listItem()
        .title('LMS Management')
        .icon(BookIcon)
        .child(
          S.list()
            .title('LMS Content')
            .items([
              S.documentTypeListItem('course').title('Courses').icon(BookIcon),
              S.documentTypeListItem('module').title('Modules').icon(ListIcon),
              S.documentTypeListItem('lesson').title('Lessons').icon(PresentationIcon),
            ])
        ),
      S.divider(),

      // Blog Section
      S.listItem()
        .title('Blog Management')
        .icon(DocumentTextIcon)
        .child(
          S.list()
            .title('Blog Content')
            .items([
              S.documentTypeListItem('post').title('Posts').icon(DocumentTextIcon),
              S.documentTypeListItem('author').title('Authors').icon(UsersIcon),
              S.documentTypeListItem('category').title('Categories').icon(TagIcon),
            ])
        ),
      S.divider(),

      // Marketing
      S.listItem()
        .title('Marketing & Site')
        .icon(HomeIcon)
        .child(
          S.list()
            .title('Site Content')
            .items([
              S.documentTypeListItem('testimonial').title('Testimonials').icon(StarIcon),
              S.documentTypeListItem('banner').title('Banners').icon(ImageIcon),
            ])
        ),
      S.divider(),

      // Settings
      S.listItem()
        .title('Settings')
        .icon(CogIcon)
        .child(
          S.list()
            .title('Settings')
            .items([
              S.documentTypeListItem('subscriptionTier').title('Subscription Tiers').icon(CogIcon),
            ])
        ),
    ])
