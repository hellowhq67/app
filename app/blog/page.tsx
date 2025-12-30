import { BlogFeed } from "@/components/blog/BlogFeed";
import { StickyScroll } from "@/components/ui/sticky-scroll-reveal";
import { getAllPosts } from "@/lib/blog";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
    title: "Blog | PTE Practice & Study Guides",
    description: "Latest expert tips, strategies, and guides for mastering the PTE Academic exam. Improve your speaking, writing, reading, and listening scores.",
    openGraph: {
        title: "Blog | PTE Practice & Study Guides",
        description: "Latest expert tips, strategies, and guides for mastering the PTE Academic exam.",
        type: "website",
    },
};

const featureContent = [
    {
        title: "Master PTE Speaking",
        description:
            "Our proven templates and strategies help you fluently describe images, retell lectures, and repeat sentences without hesitation. Maximise your oral fluency score.",
        content: (
            <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--cyan-500),var(--emerald-500))] flex items-center justify-center text-white">
                <span className="text-6xl font-bold">Speaking</span>
            </div>
        ),
    },
    {
        title: "Writing Essays Made Easy",
        description:
            "Don't stress about the essay structure. Use our universal template that works for any topic. Focus on grammar and vocabulary while the structure takes care of itself.",
        content: (
            <div className="h-full w-full flex items-center justify-center text-white bg-[linear-gradient(to_bottom_right,var(--orange-500),var(--yellow-500))]">
                <span className="text-6xl font-bold">Writing</span>
            </div>
        ),
    },
    {
        title: "AI Scoring Insights",
        description:
            "Understand how the automated scoring engine evaluates your responses. Learn why pronunciation and fluency matter more than content in some speaking tasks.",
        content: (
            <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--pink-500),var(--indigo-500))] flex items-center justify-center text-white">
                <span className="text-6xl font-bold">AI Scoring</span>
            </div>
        ),
    },
];

export default function BlogPage() {
    const posts = getAllPosts();

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="pt-32 pb-20 relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        Study Guides & Insights
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12">
                        Expert strategies to help you hack the PTE exam and achieve your dream score.
                    </p>
                </div>

                {/* Background decoration */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl opacity-30 pointer-events-none">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000" />
                </div>
            </section>

            {/* Featured Sticky Scroll */}
            <section className="py-20 bg-muted/20">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-12 text-center">Key Pillars of Success</h2>
                    <StickyScroll content={featureContent} />
                </div>
            </section>

            {/* Blog Timeline Feed */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-12 text-center">Latest Updates & Guides</h2>
                    <BlogFeed posts={posts} />
                </div>
            </section>
        </div>
    );
}
