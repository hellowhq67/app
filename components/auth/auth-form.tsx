"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, Github, Mail } from "lucide-react";

interface AuthFormProps {
	mode: "sign-in" | "sign-up";
}

export function AuthForm({ mode }: AuthFormProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!email || !password || (mode === "sign-up" && !name)) {
			toast.error("Please fill in all fields.");
			return;
		}

		setIsLoading(true);
		try {
			if (mode === "sign-up") {
				await authClient.signUp.email({
					email,
					password,
					name,
					callbackURL: "/pte/dashboard",
				}, {
                    onSuccess: () => {
                        toast.success("Account created successfully!");
                        router.push("/pte/dashboard");
                    },
                    onError: (ctx) => {
                        toast.error(ctx.error.message || "Failed to sign up.");
                    }
                });
			} else {
				await authClient.signIn.email({
					email,
					password,
					callbackURL: "/pte/dashboard",
				}, {
                    onSuccess: () => {
                        toast.success("Signed in successfully!");
                        router.push("/pte/dashboard");
                    },
                    onError: (ctx) => {
                        toast.error(ctx.error.message || "Invalid credentials.");
                    }
                });
			}
		} catch (error) {
			toast.error("An unexpected error occurred.");
		} finally {
			setIsLoading(false);
		}
	}

	const handleSocialSignIn = async (provider: "google" | "github") => {
		await authClient.signIn.social({
			provider,
			callbackURL: "/pte/dashboard",
		});
	};

	return (
		<div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
			<form onSubmit={onSubmit} className="space-y-4">
				{mode === "sign-up" && (
					<div className="space-y-2 group">
						<Label htmlFor="name" className="group-focus-within:text-primary transition-colors">Name</Label>
						<Input 
							id="name"
							placeholder="John Doe" 
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
							className="input-focus-ring"
						/>
					</div>
				)}
				<div className="space-y-2 group">
					<Label htmlFor="email" className="group-focus-within:text-primary transition-colors">Email</Label>
					<Input 
						id="email"
						type="email"
						placeholder="name@example.com" 
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						className="input-focus-ring"
					/>
				</div>
				<div className="space-y-2 group">
					<Label htmlFor="password" className="group-focus-within:text-primary transition-colors">Password</Label>
					<Input 
						id="password"
						type="password" 
						placeholder="••••••••" 
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						className="input-focus-ring"
					/>
				</div>
				<Button 
					className={`w-full transition-all duration-300 ${isLoading ? "opacity-90 scale-[0.98]" : "hover:scale-[1.01] active:scale-[0.99]"}`} 
					type="submit" 
					disabled={isLoading}
				>
					{isLoading ? (
						<div className="flex items-center justify-center gap-2">
							<Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />
							<span>Processing...</span>
						</div>
					) : (
						mode === "sign-in" ? "Sign In" : "Create Account"
					)}
				</Button>
			</form>
			<div className="relative">
				<div className="absolute inset-0 flex items-center">
					<span className="w-full border-t" />
				</div>
				<div className="relative flex justify-center text-xs uppercase">
					<span className="bg-background px-2 text-muted-foreground">
						Or continue with
					</span>
				</div>
			</div>
			<div className="grid grid-cols-2 gap-4">
				<Button 
                    variant="outline" 
                    type="button" 
                    disabled={isLoading}
                    onClick={() => handleSocialSignIn("google")}
					className="hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 hover:scale-[1.02]"
                >
					<Mail className="mr-2 h-4 w-4" />
					Google
				</Button>
				<Button 
                    variant="outline" 
                    type="button" 
                    disabled={isLoading}
                    onClick={() => handleSocialSignIn("github")}
					className="hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 hover:scale-[1.02]"
                >
					<Github className="mr-2 h-4 w-4" />
					GitHub
				</Button>
			</div>
		</div>
	);
}
