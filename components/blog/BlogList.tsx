import { BlogPost } from "@/lib/blog";
import { BlogCard } from "./BlogCard";

interface BlogListProps {
    posts: BlogPost[];
}

export function BlogList({ posts }: BlogListProps) {
    if (!posts.length) {
        return (
            <div className="text-center py-20">
                <h3 className="text-xl font-medium text-muted-foreground">No posts found.</h3>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
                <BlogCard key={post.slug} post={post} />
            ))}
        </div>
    );
}
