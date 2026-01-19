import { defineQuery } from "next-sanity";

export const GET_FEATURED_POSTS = defineQuery(`
    *[_type == "post"] | order(publishedAt desc)[0...3] {
        title,
        "slug": slug.current,
        "author": author->name,
        "image": mainImage.asset->url,
        "categories": categories[]->title,
        publishedAt,
        isPaid,
        "description": array::join(string::split((pt::text(body)), "")[0..200], "") + "..."
    }
`);

export const GET_ALL_POSTS = defineQuery(`
    *[_type == "post"] | order(publishedAt desc) {
        title,
        "slug": slug.current,
        "author": author->name,
        "image": mainImage.asset->url,
        "categories": categories[]->title,
        publishedAt,
        isPaid,
        "description": array::join(string::split((pt::text(body)), "")[0..200], "") + "..."
    }
`);

export const GET_ALL_COURSES = defineQuery(`
    *[_type == "course"] | order(title asc) {
        title,
        "slug": slug.current,
        description,
        price,
        isFree,
        "modules": modules[]->{
            title,
            "lessons": lessons[]->{
                title,
                duration,
                isFree,
                "videoMux": video.asset->playbackId
            }
        }
    }
`);

export const GET_COURSE_BY_SLUG = defineQuery(`
    *[_type == "course" && slug.current == $slug][0] {
        title,
        "slug": slug.current,
        description,
        price,
        isFree,
        "modules": modules[]->{
            title,
            "lessons": lessons[]->{
                title,
                duration,
                isFree,
                "videoMux": video.asset->playbackId
            }
        }
    }
`);
