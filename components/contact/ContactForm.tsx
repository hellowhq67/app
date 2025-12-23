"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
// Using useActionState from react (Need to verify next version, assuming compatible or shimmed)
// If useActionState is not available, we can use a standard form handler. 
// Given the original file used it, I will stick to it or standard fetch.
// Actually, to be safe and portable, I'll use standard onSubmit here without the experimental hook unless necessary.
// Rewriting to standard simpler react form for the homepage component.

export function ContactForm() {
    const [isPending, setIsPending] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsPending(true);
        setSubmitStatus("idle");

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name"),
            email: formData.get("email"),
            subject: formData.get("subject"),
            category: formData.get("category"),
            message: formData.get("message"),
        };

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                setSubmitStatus("success");
                formRef.current?.reset();
            } else {
                setSubmitStatus("error");
            }
        } catch (error) {
            console.error("Contact form error:", error);
            setSubmitStatus("error");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="rounded-2xl border bg-card p-6 sm:p-10 shadow-lg" id="contact-form">
            <h2 className="mb-2 text-2xl font-bold">Send Us a Message</h2>
            <p className="mb-6 text-muted-foreground">We'd love to hear from you. Fill out the form below.</p>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="Your full name"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="your@email.com"
                            required
                        />
                    </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select name="category" required>
                            <SelectTrigger id="category">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="general">General Inquiry</SelectItem>
                                <SelectItem value="technical">Technical Support</SelectItem>
                                <SelectItem value="billing">Billing & Payments</SelectItem>
                                <SelectItem value="feedback">Feedback & Suggestions</SelectItem>
                                <SelectItem value="partnership">Partnership</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="subject">Subject *</Label>
                        <Input
                            id="subject"
                            name="subject"
                            placeholder="Brief subject line"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                        id="message"
                        name="message"
                        placeholder="Tell us how we can help you..."
                        rows={4}
                        required
                    />
                </div>

                {submitStatus === "success" && (
                    <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        ✓ Message sent successfully! We'll get back to you within 24 hours.
                    </div>
                )}

                {submitStatus === "error" && (
                    <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                        ✗ Failed to send message. Please try again or email us directly.
                    </div>
                )}

                <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                        </>
                    ) : (
                        <>
                            <Send className="mr-2 h-4 w-4" />
                            Send Message
                        </>
                    )}
                </Button>
            </form>
        </div>
    )
}
