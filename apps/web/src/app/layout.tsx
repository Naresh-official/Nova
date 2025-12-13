import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@nova/ui/globals.css";
import { ConditionalLayout } from "@/components/layout/ConditionalLayout";
import { TRPCProvider } from "@/components/providers/TRPCProvider";
import NextAuthSessionProvider from "@/components/providers/SessionProvider";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryStoreProvider } from "@/components/providers/QueryStoreProvider";
import { RefreshStoreProvider } from "@/components/providers/RefreshStoreProvider";
import { Toaster } from "@nova/ui/components/sonner";
import { ChatNavigationProvider } from "@/components/providers/ChatNavigationProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Nova - AI-Powered Email Client",
	description: "Premium email experience with AI assistance",
	icons: {
		icon: "/logo.svg",
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
				<NextAuthSessionProvider>
					<TRPCProvider>
						<QueryStoreProvider>
							<RefreshStoreProvider>
								<ChatNavigationProvider>
									<ConditionalLayout>{children}</ConditionalLayout>
									<Toaster />
								</ChatNavigationProvider>
							</RefreshStoreProvider>
							{/* <ReactQueryDevtools initialIsOpen={false} /> */}
						</QueryStoreProvider>
					</TRPCProvider>
				</NextAuthSessionProvider>
			</body>
		</html>
	);
}
