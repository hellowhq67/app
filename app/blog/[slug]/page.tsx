import { notFound } from "next/navigation";
import Image from "next/image";
import { Metadata } from "next";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { TracingBeam } from "@/components/ui/tracing-beam";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, UserIcon, Clock } from "lucide-react";

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = getPostBySlug(slug);

    if (!post) {
        return {
            title: "Post Not Found",
        };
    }

    return {
        title: `${post.title} | PTE Blog`,
        description: post.description,
        keywords: post.seoKeywords,
        openGraph: {
            title: post.title,
            description: post.description,
            type: "article",
            images: post.image ? [post.image] : [],
        },
    };
}

export async function generateStaticParams() {
    const posts = getAllPosts();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const post = getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background pt-32 pb-20 relative">
            <TracingBeam className="px-6">
                <div className="max-w-2xl mx-auto antialiased pt-4 relative">
                    <div className="mb-8 relative h-64 md:h-96 w-full rounded-2xl overflow-hidden shadow-xl">
                        {post.image ? (
                            <Image
                                src={post.image}
                                alt={post.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                <span className="text-4xl font-bold text-muted-foreground/50">
                                    {post.title.charAt(0)}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                                {tag}
                            </Badge>
                        ))}
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                        {post.title}
                    </h1>

                    <div className="flex items-center gap-6 text-muted-foreground mb-10 text-sm border-b border-border/50 pb-6">
                        <span className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4" />
                            {post.date}
                        </span>
                        <span className="flex items-center gap-2">
                            <UserIcon className="w-4 h-4" />
                            {post.author}
                        </span>
                        <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            5 min read
                        </span>
                    </div>

                    <div
                        className="prose prose-lg dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </div>
            </TracingBeam>
        </div>
    );
}
