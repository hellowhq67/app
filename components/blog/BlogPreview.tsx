"use client";

import { BlogPost } from "@/lib/types/blogTypes";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, UserIcon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BlogPreviewProps {
    post: BlogPost;
    isHighlighted?: boolean;
}

export function BlogPreview({ post, isHighlighted = false }: BlogPreviewProps) {
    return (
        <div className={`group relative rounded-2xl overflow-hidden transition-all duration-300 ${
            isHighlighted 
                ? 'ring-2 ring-primary shadow-xl' 
                : 'hover:shadow-lg'
        }`}>
            {/* Image Section */}
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
                {post.image ? (
                    <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <span className="text-6xl font-bold text-muted-foreground/30">
                            {post.title.charAt(0).toUpperCase()}
                        </span>
                    </div>
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <Button asChild variant="secondary" size="sm" className="w-full">
                        <Link href={`/blog/${post.slug}`}>
                            Read Full Article
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-6 bg-card/50 backdrop-blur-sm border border-border/50">
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                        </Badge>
                    ))}
                    {post.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                            +{post.tags.length - 3}
                        </Badge>
                    )}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {post.description}
                </p>

                {/* Meta Information */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border/30 pt-4">
                    <span className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                        <UserIcon className="w-3 h-3" />
                        {post.author}
                    </span>
                </div>

                {/* CTA Link */}
                <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center mt-4 text-sm font-medium text-primary hover:gap-2 transition-all group/link"
                >
                    Read Article
                    <ArrowRight className="ml-1 w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    );
}
