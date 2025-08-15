"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { NovaHeader } from "@/components/header/NovaHeader";
import { useRefreshStore } from "@/components/providers/RefreshStoreProvider";
import EmailListContent from "./EmailListContent";
import DraftListContent from "./DraftListContent";

function EmailList() {
	const pathname = usePathname();
	const isRefreshing = useRefreshStore((state) => state.isRefreshing);
	const folder = pathname.split("/").pop() || "";
	const isDraftsFolder = folder === "drafts";

	return (
		<div className="w-screen md:w-[420px] bg-black rounded-lg">
			<NovaHeader />
			<div className="scroll-container h-[calc(100vh-65px)] sm:h-[calc(100vh-80px)] px-2">
				{isDraftsFolder ? (
					<DraftListContent isRefreshing={isRefreshing} />
				) : (
					<EmailListContent folder={folder} isRefreshing={isRefreshing} />
				)}
			</div>
		</div>
	);
}

export default EmailList;
