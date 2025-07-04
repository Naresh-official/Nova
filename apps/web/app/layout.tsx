import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@nova/ui/globals.css";
import { ConditionalLayout } from "@/components/ConditionalLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Nova - AI-Powered Email Client",
	description: "Premium email experience with AI assistance",
	icons: {
		icon: "logo.svg",
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className="dark">
			<body
				className={`${inter.className} bg-[#101010] text-white antialiased`}
			>
				<ConditionalLayout>{children}</ConditionalLayout>
			</body>
		</html>
	);
}
