"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { BlogPost } from "@/lib/types/blogTypes";

interface SearchResult extends BlogPost {
    relevanceScore?: number;
}

export function BlogSearch() {
    const [query, setQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    const handleSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults([]);
            setShowResults(false);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch("/api/blog/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: searchQuery }),
            });

            if (response.ok) {
                const data = await response.json();
                setResults(data.results || []);
                setShowResults(true);
            }
        } catch (error) {
            console.error("Search error:", error);
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (query) {
                handleSearch(query);
            } else {
                setResults([]);
                setShowResults(false);
            }
        }, 300);

        return () => clearTimeout(handler);
    }, [query, handleSearch]);

    // Close results when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowResults(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={searchRef} className="relative w-full max-w-md">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search articles with AI..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query && setShowResults(true)}
                    className="pl-10 pr-10"
                />
                {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
                )}
            </div>

            {/* Search Results Dropdown */}
            {showResults && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border/50 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    {results.map((post) => (
                        <Link
                            key={post.slug}
                            href={`/blog/${post.slug}`}
                            onClick={() => setShowResults(false)}
                            className="block p-4 border-b border-border/30 last:border-b-0 hover:bg-muted/50 transition-colors group"
                        >
                            <h4 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">
                                {post.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {post.description}
                            </p>
                            {post.relevanceScore && (
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="text-xs text-muted-foreground">
                                        Relevance: {(post.relevanceScore * 100).toFixed(0)}%
                                    </div>
                                </div>
                            )}
                        </Link>
                    ))}
                </div>
            )}

            {showResults && query && results.length === 0 && !isSearching && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border/50 rounded-lg shadow-lg z-50 p-4 text-center">
                    <p className="text-sm text-muted-foreground">No articles found matching your query.</p>
                </div>
            )}
        </div>
    );
}
