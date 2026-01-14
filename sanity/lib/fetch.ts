import { sanityFetch } from "./live";
import { GET_FEATURED_POSTS, GET_ALL_POSTS, GET_ALL_COURSES } from "./queries";

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
