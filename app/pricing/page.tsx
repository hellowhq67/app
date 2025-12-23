import Link from 'next/link'
import { Check, Crown, Star, X, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  SubscriptionTier,
  TIER_FEATURES_DISPLAY,
  TIER_PRICING,
} from '@/lib/subscription/tiers'


const tierIcons = {
  [SubscriptionTier.FREE]: Star,
  [SubscriptionTier.PRO]: Zap,
  [SubscriptionTier.PREMIUM]: Crown,
}

const tierColors = {
  [SubscriptionTier.FREE]: 'from-gray-500 to-gray-600',
  [SubscriptionTier.PRO]: 'from-blue-500 to-purple-600',
  [SubscriptionTier.PREMIUM]: 'from-purple-600 to-pink-600',
}

export default function PricingPage() {
  const tiers = [
    SubscriptionTier.FREE,
    SubscriptionTier.PRO,
    SubscriptionTier.PREMIUM,
  ]

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 selection:bg-primary/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-primary/10 to-transparent blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-20 lg:py-32">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
          <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/20 text-primary bg-primary/5 uppercase tracking-widest font-black text-[10px]">
            Investment Plans
          </Badge>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
            Scale Your <span className="bg-gradient-to-r from-primary via-blue-400 to-accent bg-clip-text text-transparent italic">Ambition.</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            From focused practice to full AI mentorship, find the gear that drives you to 79+.
            Join 25,000 students already training for excellence.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {tiers.map((tier) => {
            const pricing = TIER_PRICING[tier]
            const features = TIER_FEATURES_DISPLAY[tier]
            const Icon = tierIcons[tier]
            const isPopular = tier === SubscriptionTier.PRO

            return (
              <Card
                key={tier}
                className={cn(
                  "relative group overflow-hidden border-white/5 bg-secondary/10 backdrop-blur-xl transition-all duration-500 hover:translate-y-[-10px] hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)]",
                  isPopular && "border-primary/30 ring-1 ring-primary/20 bg-secondary/20"
                )}
              >
                {isPopular && (
                  <div className="bg-primary text-white font-black text-[10px] uppercase tracking-widest absolute top-6 right-[-34px] rotate-45 w-32 text-center py-1.5 shadow-lg">
                    HOT
                  </div>
                )}

                <CardHeader className="p-8 text-center space-y-4">
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6",
                    tier === SubscriptionTier.FREE ? "bg-zinc-800" : "bg-gradient-to-br from-primary to-accent"
                  )}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>

                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-black uppercase tracking-tight">{tier}</CardTitle>
                    <CardDescription className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      {tier === SubscriptionTier.FREE ? 'Beginner' : tier === SubscriptionTier.PRO ? 'Scholar' : 'Elite'}
                    </CardDescription>
                  </div>

                  <div className="pt-4">
                    {pricing.price === 0 ? (
                      <span className="text-5xl font-black tracking-tighter italic">FREE</span>
                    ) : (
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-sm font-black text-muted-foreground">$</span>
                        <span className="text-6xl font-black tracking-tighter">{pricing.price}</span>
                        <span className="text-sm font-bold text-muted-foreground">/{pricing.period}</span>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-8 space-y-8 border-t border-white/5 bg-white/[0.02]">
                  <ul className="space-y-4">
                    {features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 border border-primary/20">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    className={cn(
                      "w-full h-14 rounded-2xl text-lg font-black shadow-xl transition-all",
                      isPopular ? "bg-primary hover:bg-primary/90 shadow-primary/20" : "bg-white/5 border border-white/10 hover:bg-white/10"
                    )}
                    variant={tier === SubscriptionTier.FREE ? 'outline' : 'default'}
                  >
                    <Link href={tier === SubscriptionTier.FREE ? '/sign-up' : `/checkout/${tier}`}>
                      {tier === SubscriptionTier.FREE ? 'GET STARTED' : 'GO PRO'}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
      {/* Feature Comparison */}
      <div className="container relative z-10 mx-auto px-4 pb-32">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-black tracking-tight uppercase">
            Full <span className="text-primary tracking-normal">Capability</span> Grid
          </h2>

          <Card className="border-white/5 bg-secondary/5 backdrop-blur-md overflow-hidden rounded-3xl">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                      <th className="p-6 text-left font-black uppercase tracking-widest text-muted-foreground">Feature</th>
                      <th className="p-6 text-center font-black uppercase tracking-widest text-muted-foreground">Free</th>
                      <th className="p-6 text-center font-black uppercase tracking-widest text-primary bg-primary/5">Pro</th>
                      <th className="p-6 text-center font-black uppercase tracking-widest text-muted-foreground">Premium</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Mock Tests', free: '1', pro: '200', premium: '200' },
                      { name: 'Practice Bank', free: 'Limited', pro: 'Unlimited', premium: 'Unlimited' },
                      { name: 'AI Feedback', free: '10/day', pro: 'Unlimited', premium: 'Unlimited' },
                      { name: 'Study Reports', free: true, pro: true, premium: true },
                      { name: 'Deep Analytics', free: false, pro: true, premium: true },
                      { name: 'VIP Mentorship', free: false, pro: false, premium: true },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                        <td className="p-6 font-bold">{row.name}</td>
                        <td className="p-6 text-center">
                          {typeof row.free === 'boolean' ? (row.free ? <Check className="mx-auto text-primary" /> : <X className="mx-auto text-muted-foreground/30" />) : row.free}
                        </td>
                        <td className="p-6 text-center bg-primary/5 font-bold text-primary">
                          {typeof row.pro === 'boolean' ? (row.pro ? <Check className="mx-auto" /> : <X className="mx-auto text-muted-foreground/30" />) : row.pro}
                        </td>
                        <td className="p-6 text-center">
                          {typeof row.premium === 'boolean' ? (row.premium ? <Check className="mx-auto text-primary" /> : <X className="mx-auto text-muted-foreground/30" />) : row.premium}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container relative z-10 mx-auto px-4 pb-32">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black mb-12 text-center tracking-tight uppercase">Common <span className="text-primary tracking-normal">Inquiries</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { q: 'Can I try before I buy?', a: 'Absolutely. Our Free Forever plan lets you experience the core AI laboratory without a credit card.' },
              { q: 'How do AI credits work?', a: 'Credits recharge daily at midnight. Pro users get untethered access to all models and vocal analysis.' },
              { q: 'Is the scoring accurate?', a: 'Our models are trained on 1M+ successful Pearson PTE attempts, achieving 98.4% correlation with official results.' },
              { q: 'Can I cancel anytime?', a: 'Yes. One click, no questions. Your data and progress remain yours even after cancellation.' },
            ].map((faq, i) => (
              <Card key={i} className="border-white/5 bg-secondary/10 hover:bg-secondary/20 transition-all p-6 rounded-2xl">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {faq.q}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
