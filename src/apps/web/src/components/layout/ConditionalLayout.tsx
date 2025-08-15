"use client";

import React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { redirect } from "next/navigation";
import { SidebarProvider } from "@nova/ui/components/sidebar";
import { NovaSidebar } from "@/components/sidebar/NovaSidebar";
import { ComposeMail } from "../compose/components/ComposeMail";

interface ConditionalLayoutProps {
	children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
	const pathname = usePathname();

	const isComposeOpen = useSearchParams().get("isComposeOpen");

	const folders = ["INBOX", "SENT", "DRAFTS", "ARCHIVE", "TRASH", "SPAM"];

	const isMailPage = pathname.startsWith("/mail");
	const isValidMailPage = folders.includes(
		pathname.split("/")[2]?.toUpperCase()
	);
	const isSettingsPage = pathname.startsWith("/settings");

	if (isMailPage && !isValidMailPage) {
		redirect("/404");
	}

	const showSidebar = isMailPage || isSettingsPage;

	if (!showSidebar) {
		return (
			<main className="min-h-screen w-screen flex items-center justify-center">
				{children}
			</main>
		);
	}

	return (
		<div className="h-screen w-full ">
			<SidebarProvider defaultOpen={true}>
				<NovaSidebar />
				<main className="flex-1 overflow-auto">{children}</main>
			</SidebarProvider>
			{isComposeOpen && <ComposeMail />}
		</div>
	);
}
