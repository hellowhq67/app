import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Authentication",
	description: "Authentication pages for Pedagogist's PTE.",
};

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
