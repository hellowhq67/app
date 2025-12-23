"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { authClient } from "@/lib/auth/client";
import { getCallbackURL } from "@/lib/auth/shared";
import { toast } from "sonner";
import Link from "next/link";

export default function SignInPage() {
	const router = useRouter();
	const params = useSearchParams();

	useEffect(() => {
		authClient.oneTap({
			fetchOptions: {
				onError: ({ error }) => {
					// Silent error for one-tap if it fails to load
					console.debug("One-tap error:", error.message);
				},
				onSuccess: () => {
					toast.success("Successfully signed in!");
					router.push(getCallbackURL(params));
				},
			},
		});
	}, [router, params]);

	return (
		<div className="container relative flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0 min-h-screen">
			<div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
				<div className="absolute inset-0 bg-zinc-900" />
				<div className="relative z-20 flex items-center text-lg font-medium">
					<div className="mr-2 flex h-8 w-8 items-center justify-center rounded bg-blue-600">
						P
					</div>
					Pedagogist's PTE
				</div>
				<div className="relative z-20 mt-auto">
					<blockquote className="space-y-2">
						<p className="text-lg">
							&ldquo;This platform has completely transformed how I prepare for the PTE Academic exam. The AI scoring is incredibly accurate.&rdquo;
						</p>
						<footer className="text-sm">Sofia Chen</footer>
					</blockquote>
				</div>
			</div>
			<div className="p-8">
				<div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
					<div className="flex flex-col space-y-2 text-center">
						<h1 className="text-2xl font-semibold tracking-tight">
							Welcome back
						</h1>
						<p className="text-sm text-muted-foreground">
							Enter your email to sign in to your account
						</p>
					</div>
					<AuthForm mode="sign-in" />
					<p className="px-8 text-center text-sm text-muted-foreground">
						Don't have an account?{" "}
						<Link
							href="/sign-up"
							className="underline underline-offset-4 hover:text-primary"
						>
							Sign Up
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
