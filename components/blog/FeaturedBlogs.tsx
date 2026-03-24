import Link from "next/link";
import { BlogCard } from "./BlogCard";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFeaturedPostsFromSanity } from "@/sanity/lib/fetch";
// import { BlogPost } from "@/lib/types/blogTypes";

// Shim to adapt Sanity data to BlogPost interface if needed, or update BlogCard to accept Sanity data
// For now, we will map it here.
interface SanityPost {
    title: string;
    slug: string;
    author: string;
    image: string;
    categories: string[];
    publishedAt: string;
    description: string;
    isPaid?: boolean;
}

export async function FeaturedBlogs() {
    let sanityPosts: SanityPost[] = [];
    try {
        sanityPosts = await getFeaturedPostsFromSanity();
    } catch {
        // Sanity unavailable — render empty state gracefully
    }

    // Transform Sanity data to match what BlogCard might expect or update BlogCard. 
    // Assuming BlogCard expects BlogPost, we map minimal data.
    const posts = sanityPosts.map((post: SanityPost) => ({
        slug: post.slug,
        title: post.title,
        description: post.description,
        author: post.author,
        date: new Date(post.publishedAt).toLocaleDateString(),
        tags: post.categories || [],
        image: post.image,
        seoKeywords: [], // defaulting
        content: "", // defaulting
        isPaid: post.isPaid
    }));

    return (
        <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            Latest Insights & Guides
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl">
                            Expert tips, strategies, and updates to help you master your exam preparation.
                        </p>
                    </div>
                    <Button variant="outline" asChild className="hidden md:flex">
                        <Link href="/blog" className="group">
                            View All Articles
                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {posts.length > 0 ? (
                        posts.map((post: any) => (
                            <BlogCard key={post.slug} post={post} />
                        ))
                    ) : (
                        <div className="col-span-3 text-center py-12 text-muted-foreground">
                            No posts found. Add content in Sanity Studio.
                        </div>
                    )}
                </div>

                <div className="mt-8 text-center md:hidden">
                    <Button variant="outline" asChild>
                        <Link href="/blog">
                            View All Articles
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
