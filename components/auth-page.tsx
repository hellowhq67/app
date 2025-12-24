"use client";


import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { AtSignIcon, ChevronLeftIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import type React from "react";
import { FloatingPaths } from "@/components/floating-paths";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth/client';

interface AuthPageProps {
  mode?: 'login' | 'signup';
}

export function AuthPage({ mode = 'login' }: AuthPageProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: mode === 'login' ? '/pte/dashboard' : '/pte/dashboard', // Same redirect for both modes
      });
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // In a real app, you would call your auth API here
    // For now, we'll simulate the process and redirect to the existing auth
    try {
      if (mode === 'login') {
        // Redirect to existing login form which handles Google auth properly
        router.push('/sign-in');
      } else {
        // Redirect to existing signup form which handles Google auth properly
        router.push('/sign-up');
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    router.push(mode === 'login' ? '/sign-up' : '/sign-in');
  };

  return (
    <main className="relative md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2">
      <div className="relative hidden h-full flex-col border-r bg-secondary p-10 lg:flex dark:bg-secondary/20">
        <div className="mr-auto font-bold text-xl tracking-tight">PEDAGOGIST</div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />


        <div className="z-10 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-xl">
              &ldquo;This Platform has helped me to save time and serve my
              clients faster than ever before.&rdquo;
            </p>
            <footer className="font-mono font-semibold text-sm">
              ~ Ali Hassan
            </footer>
          </blockquote>
        </div>
        <div className="absolute inset-0">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
      </div>
      <div className="relative flex min-h-screen flex-col justify-center p-4">
        <div
          aria-hidden
          className="-z-10 absolute inset-0 isolate opacity-60 contain-strict"
        >
          <div className="-translate-y-87.5 absolute top-0 right-0 h-320 w-140 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,--theme(--color-foreground/.06)_0,hsla(0,0%,55%,.02)_50%,--theme(--color-foreground/.01)_80%)]" />
          <div className="absolute top-0 right-0 h-320 w-60 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] [translate:5%_-50%]" />
          <div className="-translate-y-87.5 absolute top-0 right-0 h-320 w-60 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)]" />
        </div>
        <Button asChild className="absolute top-7 left-5" variant="ghost">
          <a href="/">
            <ChevronLeftIcon />
            Home
          </a>
        </Button>
        <div className="mx-auto space-y-4 sm:w-sm">
          <div className="font-bold text-xl tracking-tight lg:hidden">PEDAGOGIST</div>
          <div className="flex flex-col space-y-1">
            <h1 className="font-bold text-2xl tracking-wide">
              {mode === 'login' ? 'Welcome Back!' : 'Create Account'}
            </h1>
            <p className="text-base text-muted-foreground">
              {mode === 'login'
                ? 'Sign in to your account'
                : 'Create your account to get started'}
            </p>
          </div>

          <Button
            className="w-full"
            size="lg"
            type="button"
            onClick={handleGoogleLogin}
          >
            <GoogleIcon />
            Continue with Google
          </Button>

          <div className="flex w-full items-center justify-center">
            <div className="h-px w-full bg-border" />
            <span className="px-2 text-muted-foreground text-xs">OR</span>
            <div className="h-px w-full bg-border" />
          </div>

          <form className="space-y-2" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div>
                <InputGroup>
                  <InputGroupInput
                    placeholder="Full name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required={mode === 'signup'}
                  />
                </InputGroup>
              </div>
            )}
            <div>
              <InputGroup>
                <InputGroupInput
                  placeholder="your.email@example.com"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <InputGroupAddon>
                  <AtSignIcon />
                </InputGroupAddon>
              </InputGroup>
            </div>
            <div>
              <InputGroup>
                <InputGroupInput
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <InputGroupAddon
                  onClick={() => setShowPassword(!showPassword)}
                  className="cursor-pointer"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </InputGroupAddon>
              </InputGroup>
            </div>

            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Sign Up')}
            </Button>
          </form>

          <div className="flex justify-center text-sm">
            <button
              onClick={toggleMode}
              className="text-primary hover:underline"
            >
              {mode === 'login'
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>

          <p className="mt-8 text-muted-foreground text-sm">
            By clicking continue, you agree to our{" "}
            <a
              className="underline underline-offset-4 hover:text-primary"
              href="#"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              className="underline underline-offset-4 hover:text-primary"
              href="#"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}

const GoogleIcon = (props: React.ComponentProps<"svg">) => (
  <svg
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g>
      <path d="M12.479,14.265v-3.279h11.049c0.108,0.571,0.164,1.247,0.164,1.979c0,2.46-0.672,5.502-2.84,7.669   C18.744,22.829,16.051,24,12.483,24C5.869,24,0.308,18.613,0.308,12S5.869,0,12.483,0c3.659,0,6.265,1.436,8.223,3.307L18.392,5.62   c-1.404-1.317-3.307-2.341-5.913-2.341C7.65,3.279,3.873,7.171,3.873,12s3.777,8.721,8.606,8.721c3.132,0,4.916-1.258,6.059-2.401   c0.927-0.927,1.537-2.251,1.777-4.059L12.479,14.265z" />
    </g>
  </svg>
);