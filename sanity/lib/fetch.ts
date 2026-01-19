import { sanityFetch } from "./live";
import { GET_FEATURED_POSTS, GET_ALL_POSTS, GET_ALL_COURSES, GET_COURSE_BY_SLUG } from "./queries";

export async function getFeaturedPostsFromSanity() {
    const { data } = await sanityFetch({
        query: GET_FEATURED_POSTS,
    });
    return data;
}

export async function getAllPostsFromSanity() {
    const { data } = await sanityFetch({
        query: GET_ALL_POSTS,
    });
    return data;
}

export async function getAllCoursesFromSanity() {
    const { data } = await sanityFetch({
        query: GET_ALL_COURSES,
    });
    return data;
}

export async function getCourseBySlugFromSanity(slug: string) {
    const { data } = await sanityFetch({
        query: GET_COURSE_BY_SLUG,
        params: { slug },
    });
    return data;
}
