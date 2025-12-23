import { Metadata } from "next";
import { createMetadata } from "@/lib/auth/metadata";

export const metadata: Metadata = createMetadata({
	title: "Authentication",
	description: "Authentication pages for Pedagogist's PTE.",
});

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen bg-background">
			{children}
		</div>
	);
}
