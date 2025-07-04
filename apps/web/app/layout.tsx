import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@nova/ui/globals.css";
import { SidebarProvider } from "@nova/ui/components/sidebar";
import { NovaSidebar } from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Nova - AI-Powered Email Client",
	description: "Premium email experience with AI assistance",
	generator: "v0.dev",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className="dark">
			<body
				className={`${inter.className} bg-black text-white antialiased`}
			>
				<SidebarProvider defaultOpen={true}>
					<NovaSidebar />
					<main>{children}</main>
				</SidebarProvider>
			</body>
		</html>
	);
}
