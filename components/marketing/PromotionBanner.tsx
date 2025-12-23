"use client";

import { useState, useEffect } from "react";
import { X, Gift, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PromotionBannerProps {
    duration?: number; // Duration in milliseconds, default 10000 (10s)
}

export function PromotionBanner({ duration = 10000 }: PromotionBannerProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsVisible(false);
        }, 500); // Wait for exit animation
    };

    if (!isVisible) return null;

    return (
        <div
            className={cn(
                "relative w-full overflow-hidden bg-gradient-to-r from-primary/90 via-destructive/90 to-primary/90 text-primary-foreground shadow-lg transition-all duration-500",
                isClosing ? "-mt-20 opacity-0" : "opacity-100"
            )}
            role="banner"
        >
            {/* Snow/Sparkle Background Effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-50%] left-[-10%] w-[120%] h-[200%] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                <div className="absolute animate-[pulse_3s_ease-in-out_infinite] top-2 left-1/4 text-yellow-300/40">
                    <Sparkles className="w-6 h-6" />
                </div>
                <div className="absolute animate-[pulse_4s_ease-in-out_infinite] delay-700 bottom-2 right-1/3 text-white/30">
                    <Sparkles className="w-4 h-4" />
                </div>
            </div>

            <div className="container relative mx-auto flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                <div className="flex flex-1 items-center justify-center sm:justify-start gap-3 text-center sm:text-left">
                    <div className="flex p-2 bg-white/10 rounded-full backdrop-blur-sm shadow-inner shrink-0 animate-bounce">
                        <Gift className="h-5 w-5 text-yellow-300" />
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-sm sm:text-base font-medium">
                        <span className="font-bold text-yellow-200 uppercase tracking-wider text-xs sm:text-sm">
                            Holiday Special
                        </span>
                        <span className="hidden sm:inline text-white/60">•</span>
                        <p className="max-w-[calc(100vw-8rem)] truncate">
                            Unlock premium PTE materials at{" "}
                            <Link
                                href="https://pedagogists.com"
                                target="_blank"
                                className="underline decoration-yellow-300/50 hover:decoration-yellow-300 underline-offset-4 font-bold text-white hover:text-yellow-200 transition-colors"
                            >
                                pedagogists.com
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    <Link
                        href="https://pedagogists.com"
                        target="_blank"
                        className="hidden sm:inline-flex items-center justify-center rounded-full bg-white px-4 py-1 text-xs font-bold text-primary shadow-sm hover:bg-yellow-50 transition-colors"
                    >
                        Get Offer
                    </Link>
                    <button
                        onClick={handleClose}
                        className="group relative -mr-2 rounded-full p-2 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
                        aria-label="Dismiss banner"
                    >
                        <X className="h-5 w-5 text-white/90 group-hover:text-white transition-colors" />
                        <span className="sr-only">Dismiss</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
