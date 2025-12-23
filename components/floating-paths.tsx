'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface FloatingPathsProps {
    position: number;
    className?: string;
}

export function FloatingPaths({ position, className }: FloatingPathsProps) {
    return (
        <div
            className={cn(
                'pointer-events-none absolute inset-0 overflow-hidden opacity-30',
                className
            )}
        >
            <svg
                className="absolute inset-0 h-full w-full"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <linearGradient id={`gradient-${position}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                        <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path
                    d={
                        position > 0
                            ? 'M0,100 Q50,50 100,100 T200,100 T300,100 T400,100'
                            : 'M0,0 Q50,50 100,0 T200,0 T300,0 T400,0'
                    }
                    stroke={`url(#gradient-${position})`}
                    strokeWidth="2"
                    fill="none"
                    className="animate-pulse"
                />
                <path
                    d={
                        position > 0
                            ? 'M0,80 Q60,30 120,80 T240,80 T360,80 T480,80'
                            : 'M0,20 Q60,70 120,20 T240,20 T360,20 T480,20'
                    }
                    stroke={`url(#gradient-${position})`}
                    strokeWidth="1.5"
                    fill="none"
                    className="animate-pulse"
                    style={{ animationDelay: '0.5s' }}
                />
            </svg>
        </div>
    );
}
