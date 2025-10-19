"use client";

import EmailContent from "@/components/email/content/components/EmailContent";
import EmailList from "@/components/email/list/components/EmailList";
import IntelligentSidebar from "@/components/chatSidebar/components/ChatSidebar";
import { useSearchParams } from "next/navigation";

export default function InboxPage() {
	const isChatOpen = useSearchParams().get("isChatOpen");

	return (
		<div className="h-screen p-0 sm:p-2 w-screen md:w-full">
			<div className="flex gap-2">
				{/* Email List */}
				<EmailList />
				{/* Email Content */}
				<EmailContent />

				{isChatOpen && <IntelligentSidebar />}
			</div>
		</div>
	);
}
