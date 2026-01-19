
"use client";

import { motion } from "framer-motion";

export function WorldMap() {
    return (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-zinc-950">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,0)_0%,rgba(9,9,11,1)_100%)] z-10" />

            {/* World Map SVG */}
            <svg
                viewBox="0 0 1000 500"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full opacity-30"
            >
                <motion.path
                    d="M200,150 Q300,50 400,150 T600,150 T800,150"
                    stroke="url(#gradient)"
                    strokeWidth="2"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatType: "loop", repeatDelay: 1 }}
                />
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                        <stop offset="50%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Dots/Grid Overlay */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

            {/* Floating Elements */}
            <motion.div
                className="absolute top-1/4 left-1/4"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
                <div className="flex items-center gap-2 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-full py-1.5 px-3 text-xs text-zinc-300">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Global Community
                </div>
            </motion.div>

            <motion.div
                className="absolute bottom-1/3 right-1/4"
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
                <div className="flex items-center gap-2 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-full py-1.5 px-3 text-xs text-zinc-300">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    Live Mock Tests
                </div>
            </motion.div>
        </div>
    );
}
