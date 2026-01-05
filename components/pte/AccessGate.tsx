'use client'

import React from 'react'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface AccessGateProps {
    children: React.ReactNode
    isPremium?: boolean
    userTier?: 'free' | 'basic' | 'premium' | 'unlimited'
}

export function AccessGate({ children, isPremium = false, userTier = 'free' }: AccessGateProps) {
    const hasAccess = !isPremium || (userTier !== 'free')

    if (hasAccess) {
        return <>{children}</>
    }

    return (
        <div className="relative group overflow-hidden rounded-xl">
            {/* Blurred Content */}
            <div className="blur-sm select-none pointer-events-none opacity-50 grayscale transition-all duration-500 group-hover:blur-md">
                {children}
            </div>

            {/* Lock Overlay */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-[2px] transition-all duration-300 group-hover:bg-black/10 dark:group-hover:bg-white/10">
                <div className="bg-white dark:bg-[#1e1e20] p-6 rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 text-center max-w-sm mx-4 transform transition-transform duration-500 hover:scale-105">
                    <div className="size-12 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 flex items-center justify-center mx-auto mb-4">
                        <Lock className="size-6" />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">Premium Content</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">
                        This high-value practice question is available for Pro members only. Upgrade to unlock unlimited practice.
                    </p>
                    <Link href="/pricing" className="block w-full">
                        <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold shadow-lg shadow-amber-500/20">
                            Unlock Now
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
