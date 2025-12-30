import Link from "next/link";
import { getRecentPosts } from "@/lib/blog";
import { BlogCard } from "./BlogCard";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export async function FeaturedBlogs() {
    const posts = getRecentPosts(3);

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
                    {posts.map(post => (
                        <BlogCard key={post.slug} post={post} />
                    ))}
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
