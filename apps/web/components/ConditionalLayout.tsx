"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider } from "@nova/ui/components/sidebar";
import { NovaSidebar } from "@/components/Sidebar";

interface ConditionalLayoutProps {
	children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
	const pathname = usePathname();
	const isLoginPage = pathname === "/login";

	if (isLoginPage) {
		return (
			<main className="min-h-screen w-screen flex items-center justify-center">
				{children}
			</main>
		);
	}

	return (
		<SidebarProvider defaultOpen={true}>
			<NovaSidebar />
			<main>{children}</main>
		</SidebarProvider>
	);
}
