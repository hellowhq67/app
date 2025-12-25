"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Brain,
    Headphones,
    PenTool,
    BookOpen,
    Mic,
    Trophy,
    Target,
    Sparkles,
    ArrowRight,
    Play,
    Info,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const practiceModules = [
    {
        title: "Speaking",
        id: "speaking",
        icon: Mic,
        color: "from-blue-600 to-indigo-600",
        lightColor: "bg-blue-50 dark:bg-blue-900/20",
        description:
            "Master oral fluency and pronunciation with AI-powered feedback.",
        tasks: [
            "Read Aloud",
            "Repeat Sentence",
            "Describe Image",
            "Retell Lecture",
            "Answer Short Question",
        ],
        progress: 65,
        totalQuestions: 1542,
    },
    {
        title: "Writing",
        id: "writing",
        icon: PenTool,
        color: "from-emerald-600 to-teal-600",
        lightColor: "bg-emerald-50 dark:bg-emerald-900/20",
        description: "Perfect your grammar and structural precision.",
        tasks: ["Summarize Written Text", "Write Essay"],
        progress: 42,
        totalQuestions: 856,
    },
    {
        title: "Reading",
        id: "reading",
        icon: BookOpen,
        color: "from-orange-600 to-amber-600",
        lightColor: "bg-orange-50 dark:bg-orange-900/20",
        description: "Enhance comprehension and analytical speed.",
        tasks: ["Fill in the Blanks", "Multiple Choice", "Reorder Paragraphs"],
        progress: 30,
        totalQuestions: 1240,
    },
    {
        title: "Listening",
        id: "listening",
        icon: Headphones,
        color: "from-purple-600 to-violet-600",
        lightColor: "bg-purple-50 dark:bg-purple-900/20",
        description: "Sharpen your auditory processing and detail retention.",
        tasks: [
            "Summarize Spoken Text",
            "Fill in the Blanks",
            "Highlight Correct Summary",
        ],
        progress: 15,
        totalQuestions: 980,
    },
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

export default function PracticePage() {
    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Premium Header/Hero */}
            <div className="relative overflow-hidden bg-[#0a0a0b] py-16 md:py-24 text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.15),transparent_70%)]" />
                <div className="container relative z-10 mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl"
                    >
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-1.5 text-sm font-semibold text-blue-400 border border-blue-500/20">
                            <Sparkles className="h-4 w-4" />
                            AI-Powered Preparation
                        </div>
                        <h1 className="mb-6 text-5xl font-black tracking-tight md:text-6xl leading-[1.1]">
                            PTE Academic{" "}
                            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                Practice Lab
                            </span>
                        </h1>
                        <p className="text-xl text-white/60 leading-relaxed md:text-2xl max-w-2xl">
                            Master every section with our high-fidelity question sets and
                            real-time AI evaluations.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto -mt-12 px-6">
                {/* Quick Stats Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-3"
                >
                    <Card className="border-white/5 bg-secondary/10 backdrop-blur-xl shadow-2xl">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-2xl bg-blue-500/20 p-3 text-blue-500">
                                <Target className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">78%</div>
                                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Target Accuracy
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-white/5 bg-secondary/10 backdrop-blur-xl shadow-2xl">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-2xl bg-indigo-500/20 p-3 text-indigo-500">
                                <Mic className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">128</div>
                                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Questions Today
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-white/5 bg-secondary/10 backdrop-blur-xl shadow-2xl">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-2xl bg-emerald-500/20 p-3 text-emerald-500">
                                <Trophy className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">Master</div>
                                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Current Level
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Practice Sections */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid gap-8 md:grid-cols-2"
                >
                    {practiceModules.map((module) => (
                        <motion.div key={module.id} variants={item}>
                            <Card className="group relative overflow-hidden h-full border-0 bg-secondary/5 transition-all duration-500 hover:shadow-2xl hover:bg-secondary/10">
                                <div
                                    className={cn(
                                        "absolute inset-0 bg-gradient-to-br opacity-[0.03] transition-opacity group-hover:opacity-[0.08]",
                                        module.color
                                    )}
                                />
                                <CardHeader className="relative z-10 flex flex-row items-start justify-between pb-4">
                                    <div className="space-y-4">
                                        <div
                                            className={cn(
                                                "inline-flex transition-transform duration-500 group-hover:scale-110 h-16 w-16 items-center justify-center rounded-2xl shadow-lg",
                                                module.lightColor
                                            )}
                                        >
                                            <module.icon
                                                className={cn(
                                                    "h-8 w-8",
                                                    module.id === "speaking"
                                                        ? "text-blue-600"
                                                        : module.id === "writing"
                                                            ? "text-emerald-600"
                                                            : module.id === "reading"
                                                                ? "text-orange-600"
                                                                : "text-purple-600"
                                                )}
                                            />
                                        </div>
                                        <div>
                                            <CardTitle className="text-3xl font-black mb-1">
                                                {module.title}
                                            </CardTitle>
                                            <p className="text-muted-foreground leading-relaxed italic">
                                                {module.description}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className="rounded-full border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold uppercase tracking-tighter"
                                    >
                                        {module.totalQuestions} Questions
                                    </Badge>
                                </CardHeader>
                                <CardContent className="relative z-10 space-y-6">
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm font-bold">
                                            <span className="text-muted-foreground uppercase tracking-widest">
                                                Section Mastery
                                            </span>
                                            <span>{module.progress}%</span>
                                        </div>
                                        <Progress value={module.progress} className="h-2" />
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {module.tasks.map((task) => (
                                            <span
                                                key={task}
                                                className="rounded-full bg-background/50 px-3 py-1.5 text-xs font-semibold text-foreground/70 border border-white/5 backdrop-blur-sm transition-colors hover:bg-background hover:text-primary"
                                            >
                                                {task}
                                            </span>
                                        ))}
                                    </div>

                                    <Button
                                        className={cn(
                                            "w-full h-12 rounded-xl text-white font-bold transition-all hover:scale-[1.02] shadow-xl",
                                            module.id === "speaking"
                                                ? "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
                                                : module.id === "writing"
                                                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                                                    : module.id === "reading"
                                                        ? "bg-orange-600 hover:bg-orange-700 shadow-orange-500/20"
                                                        : "bg-purple-600 hover:bg-purple-700 shadow-purple-500/20"
                                        )}
                                        asChild
                                    >
                                        <Link href={`/practice/${module.id}`}>
                                            Start {module.title} Lab
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Secondary Info Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="mt-20 grid gap-8 md:grid-cols-3"
                >
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Info className="h-5 w-5 text-blue-500" />
                            Practice Wisdom
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Consistently practicing even 15 minutes a day has been shown to
                            increase PTE scores by an average of 12 points over a month. Focus
                            on your weakest modules first.
                        </p>
                    </div>
                    <div className="space-y-4 border-l pl-8 border-white/5">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-indigo-500" />
                            Smart Recommendations
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Based on your recent performance, we recommend focusing on{" "}
                            <span className="text-primary font-bold">Describe Image</span>{" "}
                            today to improve your oral fluency score.
                        </p>
                    </div>
                    <div className="space-y-4 border-l pl-8 border-white/5">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Brain className="h-5 w-5 text-emerald-500" />
                            AI Insights
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Our AI has analyzed your pitch and pronunciation. You are
                            currently hitting a native-like rhythm in 85% of your 'Read Aloud'
                            attempts.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}
