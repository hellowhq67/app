"use client";

import { AuthForm } from "@/components/auth/auth-form";
import Link from "next/link";

export default function SignUpPage() {
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
							&ldquo;Joining this community was the best decision for my PTE journey. The resources and practice tools are top-notch.&rdquo;
						</p>
						<footer className="text-sm">Marcus Thompson</footer>
					</blockquote>
				</div>
			</div>
			<div className="p-8">
				<div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
					<div className="flex flex-col space-y-2 text-center">
						<h1 className="text-2xl font-semibold tracking-tight">
							Create an account
						</h1>
						<p className="text-sm text-muted-foreground">
							Enter your details below to create your account
						</p>
					</div>
					<AuthForm mode="sign-up" />
					<p className="px-8 text-center text-sm text-muted-foreground">
						By clicking continue, you agree to our{" "}
						<Link
							href="/legal/terms"
							className="underline underline-offset-4 hover:text-primary"
						>
							Terms of Service
						</Link>{" "}
						and{" "}
						<Link
							href="/legal/privacy"
							className="underline underline-offset-4 hover:text-primary"
						>
							Privacy Policy
						</Link>
						.
					</p>
                    <p className="px-8 text-center text-sm text-muted-foreground mt-4">
						Already have an account?{" "}
						<Link
							href="/sign-in"
							className="underline underline-offset-4 hover:text-primary"
						>
							Sign In
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
