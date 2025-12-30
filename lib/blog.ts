import fs from 'fs';
import path from 'path';

export interface BlogPost {
    slug: string;
    title: string;
    description: string;
    author: string;
    date: string;
    tags: string[];
    image: string;
    seoKeywords: string[];
    content: string;
}

const postsDirectory = path.join(process.cwd(), 'data/blogs');

export function getAllPosts(): BlogPost[] {
    // Ensure directory exists
    if (!fs.existsSync(postsDirectory)) {
        return [];
    }

    const fileNames = fs.readdirSync(postsDirectory);
    const allPostsData = fileNames.map((fileName) => {
        // Remove ".json" from file name to get id
        const slug = fileName.replace(/\.json$/, '');

        // Read file as string
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');

        // Parse JSON
        const postData = JSON.parse(fileContents);

        return {
            slug,
            ...postData,
        };
    });

    // Sort posts by date
    return allPostsData.sort((a, b) => {
        if (a.date < b.date) {
            return 1;
        } else {
            return -1;
        }
    });
}

export function getPostBySlug(slug: string): BlogPost | null {
    try {
        const fullPath = path.join(postsDirectory, `${slug}.json`);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const postData = JSON.parse(fileContents);
        return {
            slug,
            ...postData,
        };
    } catch (err) {
        return null;
    }
}

export function getRecentPosts(count: number = 3): BlogPost[] {
    const allPosts = getAllPosts();
    return allPosts.slice(0, count);
}

export function getAllPostSlugs(): string[] {
    const posts = getAllPosts();
    return posts.map((post) => post.slug);
}
