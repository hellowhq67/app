"use client";

import { useState } from "react";
import { X, Gift, Sparkles } from "lucide-react";

export function ChristmasBanner() {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div className="relative w-full overflow-hidden bg-gradient-to-r from-primary via-destructive to-primary py-3 px-4 sm:px-6 lg:px-8 shadow-lg">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/snow.png')] opacity-20 animate-pulse"></div>

            {/* Snowflakes decoration (CSS shapes could act as snow, but keeping it simple for now) */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="animate-shimmer absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-tr from-transparent via-white/10 to-transparent rotate-45"></div>
            </div>

            <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto text-white">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm shadow-inner ring-1 ring-white/50">
                        <Gift className="w-6 h-6 text-accent animate-bounce" />
                    </div>
                    <div className="text-center sm:text-left">
                        <p className="font-bold text-lg sm:text-xl tracking-wide drop-shadow-md">
                            <span className="text-accent-foreground drop-shadow-sm">
                                CHRISTMAS OFFER
                            </span>
                            <span className="mx-2 text-white/80">•</span>
                            <span className="text-yellow-300 font-extrabold text-2xl">
                                50% OFF
                            </span>
                        </p>
                        <p className="text-sm sm:text-base text-white/90 font-medium">
                            Get full access to PedagogistsPTE.com Premium
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button className="group relative px-6 py-2 bg-white text-primary font-bold rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 overflow-hidden">
                        <span className="relative z-10 flex items-center gap-2">
                            CLAIM NOW <Sparkles className="w-4 h-4 text-yellow-500" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-200 to-yellow-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </button>

                    <button
                        onClick={() => setIsVisible(false)}
                        className="p-1 rounded-full hover:bg-white/20 transition-colors text-white/80 hover:text-white"
                        aria-label="Close banner"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
