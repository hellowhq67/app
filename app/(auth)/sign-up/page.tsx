import { AuthForm } from "@/components/auth/auth-form";
import Link from "next/link";
import { WorldMap } from "@/components/auth/world-map";
import { Metadata } from "next";

export default function SignUpPage() {
  return (
    <div className="container relative flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0 min-h-screen">
      <div className="relative hidden h-full flex-col bg-zinc-900 text-white lg:flex dark:border-r overflow-hidden">
        <WorldMap />
        <div className="absolute inset-x-0 bottom-0 z-20 p-10 bg-gradient-to-t from-zinc-950 to-transparent">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Joining this community was the best decision for my PTE
              journey.&rdquo;
            </p>
            <footer className="text-sm text-zinc-400">Marcus Thompson</footer>
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
