'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { BookOpen, AudioLines, Sparkles, ChartBar, Timer, Shield } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

const FEATURES = [
  {
    title: 'Real PTE Question Bank',
    description: 'Practice with 5,000+ authentic questions updated daily to match the latest trends.',
    icon: BookOpen,
    color: 'from-blue-500/20 to-cyan-500/20'
  },
  {
    title: 'AI-Powered Scoring',
    description: 'Get pinpoint accuracy on pronunciation and fluency using our proprietary NLP models.',
    icon: Sparkles,
    color: 'from-purple-500/20 to-indigo-500/20'
  },
  {
    title: 'Precision Recorder',
    description: 'High-fidelity voice synthesis and analysis with real-time feedback loops.',
    icon: AudioLines,
    color: 'from-emerald-500/20 to-teal-500/20'
  },
  {
    title: 'Advanced Analytics',
    description: 'Predict your final score with 98% accuracy based on your practice performance.',
    icon: ChartBar,
    color: 'from-orange-500/20 to-red-500/20'
  },
  {
    title: 'Simulated Environment',
    description: 'Experience the stress of the actual exam with full-length timed mock tests.',
    icon: Timer,
    color: 'from-pink-500/20 to-rose-500/20'
  },
  {
    title: 'Data Sovereignty',
    description: 'Your progress data belongs to you. Fully encrypted and GDPR compliant.',
    icon: Shield,
    color: 'from-zinc-500/20 to-slate-500/20'
  },
]

export default function Features() {
  return (
    <section id="features" className="container mx-auto px-4">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-black mb-6 tracking-tight"
        >
          Engineered for <span className="text-primary italic">Success</span>
        </motion.h2>
        <p className="text-lg text-muted-foreground">
          We combine advanced linguistics with cutting-edge AI to provide an unfair advantage in your PTE preparation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((f, i) => {
          const Icon = f.icon
          return (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="group relative h-full overflow-hidden border-white/5 bg-secondary/20 backdrop-blur-sm hover:bg-secondary/30 transition-all duration-500">
                <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <CardHeader className="relative z-10 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-background border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-bold tracking-tight">{f.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <CardDescription className="text-base leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors duration-500">
                    {f.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
