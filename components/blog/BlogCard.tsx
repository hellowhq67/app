import Link from "next/link";
import Image from "next/image";
import { BlogPost } from "@/lib/blog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, UserIcon } from "lucide-react";

interface BlogCardProps {
    post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
    return (
        <Link href={`/blog/${post.slug}`} className="block group h-full">
            <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur-sm">
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                    {/* Fallback image if no image provided or placeholder */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary/20">
                        <span className="text-4xl font-bold">Blog</span>
                    </div>
                    {post.image && (
                        <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    )}
                </div>
                <CardHeader>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {post.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                    <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 text-xs mt-2">
                        <span className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            {post.date}
                        </span>
                        <span className="flex items-center gap-1">
                            <UserIcon className="w-3 h-3" />
                            {post.author}
                        </span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm line-clamp-3">
                        {post.description}
                    </p>
                </CardContent>
                <CardFooter>
                    <span className="text-sm font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                        Read Article <span aria-hidden="true">&rarr;</span>
                    </span>
                </CardFooter>
            </Card>
        </Link>
    );
}
