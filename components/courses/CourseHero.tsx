"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import React from "react";
import { motion } from "framer-motion";

export function CourseHero() {
    return (
        <section className="relative overflow-hidden py-24 lg:py-32">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 mix-blend-screen animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl opacity-50 mix-blend-screen animate-pulse delay-1000" />
            </div>

            <div className="container relative z-10 px-4 mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-6 border border-primary/20 backdrop-blur-sm">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-medium">Premium PTE Preparation</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-primary/80 to-foreground">
                        Master PTE Academic <br className="hidden md:block" />
                        With Confidence
                    </h1>

                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                        Comprehensive video courses, expert strategies, and real-time practice
                        designed to help you achieve your target score of 79+.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                            Browse Courses
                        </Button>
                        <Button size="lg" variant="outline" className="h-12 px-8 text-base backdrop-blur-sm bg-background/50">
                            Free Resources
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
