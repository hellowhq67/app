"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, TrendingUp } from "lucide-react";
import Link from "next/link";
import { BlogPost } from "@/lib/types/blogTypes";
import { BlogPreview } from "./BlogPreview";

interface SearchResult extends BlogPost {
    relevanceScore?: number;
}

export function BlogSearchAdvanced() {
    const [query, setQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const searchRef = useRef<HTMLDivElement>(null);

    // Load search history from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("blogSearchHistory");
        if (saved) {
            setSearchHistory(JSON.parse(saved).slice(0, 5));
        }
    }, []);

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

                // Add to search history
                setSearchHistory((prev) => {
                    const updated = [searchQuery, ...prev.filter(q => q !== searchQuery)].slice(0, 5);
                    localStorage.setItem("blogSearchHistory", JSON.stringify(updated));
                    return updated;
                });
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
        <div ref={searchRef} className="w-full">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search articles with AI... (e.g., 'PTE speaking tips')"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query && setShowResults(true)}
                    className="pl-10 pr-10 py-3 text-base"
                />
                {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground animate-spin" />
                )}
            </div>

            {/* Results Dropdown */}
            {showResults && (
                <div className="absolute top-full left-0 right-0 mt-4 bg-card border border-border/50 rounded-xl shadow-2xl z-50 max-h-screen overflow-hidden flex flex-col">
                    {results.length > 0 ? (
                        <>
                            <div className="overflow-y-auto max-h-96">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                                    {results.map((post, idx) => (
                                        <div
                                            key={post.slug}
                                            onClick={() => setShowResults(false)}
                                        >
                                            <BlogPreview
                                                post={post}
                                                isHighlighted={idx === 0}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="border-t border-border/50 p-4 text-xs text-muted-foreground text-center">
                                {results.length} article{results.length !== 1 ? 's' : ''} found
                            </div>
                        </>
                    ) : query ? (
                        <div className="p-8 text-center">
                            <p className="text-muted-foreground mb-4">No articles found matching &quot;{query}&quot;</p>
                            <p className="text-xs text-muted-foreground">Try different keywords or browse all articles</p>
                        </div>
                    ) : (
                        <div className="p-6">
                            {searchHistory.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                                        <h4 className="text-sm font-medium text-muted-foreground">Recent Searches</h4>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {searchHistory.map((term) => (
                                            <button
                                                key={term}
                                                onClick={() => setQuery(term)}
                                                className="px-3 py-1 text-xs rounded-full bg-muted hover:bg-muted/80 transition-colors"
                                            >
                                                {term}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
