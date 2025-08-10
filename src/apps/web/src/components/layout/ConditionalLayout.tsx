"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider } from "@nova/ui/components/sidebar";
import { NovaSidebar } from "@/components/sidebar/Sidebar";
import { ComposeMail } from "../compose/components/ComposeMail";

interface ConditionalLayoutProps {
	children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
	const pathname = usePathname();
	const [isComposeOpen, setIsComposeOpen] = useState(false);

	const isLoginPage = pathname === "/login";

	if (isLoginPage) {
		return (
			<main className="min-h-screen w-screen flex items-center justify-center">
				{children}
			</main>
		);
	}

	return (
		<div className="h-screen w-full ">
			<SidebarProvider defaultOpen={true}>
				<NovaSidebar setIsComposeOpenAction={setIsComposeOpen} />
				<main className="flex-1 overflow-auto">{children}</main>
			</SidebarProvider>
			{isComposeOpen && (
				<ComposeMail onCloseAction={() => setIsComposeOpen(false)} />
			)}
		</div>
	);
}
