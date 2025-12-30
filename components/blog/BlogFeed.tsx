"use client";

import { useState, useMemo } from "react";
import { BlogPost } from "@/lib/blog";
import { Timeline } from "@/components/ui/timeline";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface BlogFeedProps {
    posts: BlogPost[];
}

export function BlogFeed({ posts }: BlogFeedProps) {
    const [selectedTag, setSelectedTag] = useState<string>("All");

    // Extract all unique tags
    const allTags = useMemo(() => {
        const tags = new Set<string>(["All"]);
        posts.forEach((post) => {
            post.tags.forEach((tag) => tags.add(tag));
        });
        return Array.from(tags);
    }, [posts]);

    // Filter posts
    const filteredPosts = useMemo(() => {
        if (selectedTag === "All") return posts;
        return posts.filter((post) => post.tags.includes(selectedTag));
    }, [posts, selectedTag]);

    // Convert to Timeline data format
    const timelineData = filteredPosts.map((post) => ({
        title: post.date,
        content: (
            <div className="bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-4 relative aspect-video w-full overflow-hidden rounded-lg">
                    {post.image ? (
                        <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-500 hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5" />
                    )}
                </div>
                <h3 className="text-2xl font-bold mb-2">{post.title}</h3>
                <p className="text-muted-foreground mb-4 line-clamp-2">
                    {post.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map(tag => (
                        <span key={tag} className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                            {tag}
                        </span>
                    ))}
                </div>
                <Button variant="ghost" className="p-0 h-auto hover:bg-transparent hover:text-primary group" asChild>
                    <Link href={`/blog/${post.slug}`}>
                        Read Article <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </Button>
            </div>
        ),
    }));

    return (
        <div className="space-y-12">
            <div className="flex justify-center overflow-x-auto pb-4">
                <ToggleGroup
                    type="single"
                    value={selectedTag}
                    onValueChange={(value) => {
                        if (value) setSelectedTag(value);
                    }}
                    className="bg-muted/50 p-1 rounded-full border border-border/50"
                >
                    {allTags.map((tag) => (
                        <ToggleGroupItem
                            key={tag}
                            value={tag}
                            className="rounded-full px-4 py-2 data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm transition-all text-sm font-medium text-muted-foreground hover:text-foreground"
                        >
                            {tag}
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>
            </div>

            <div className="w-full">
                <Timeline data={timelineData} />
            </div>
        </div>
    );
}
