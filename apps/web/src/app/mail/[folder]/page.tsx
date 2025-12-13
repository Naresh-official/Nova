"use client";

import EmailContent from "@/components/email/content/components/EmailContent";
import EmailList from "@/components/email/list/components/EmailList";
import ChatSidebar from "@/components/chatSidebar/ChatSidebar";
import { useChatNavigationStore } from "@/components/providers/ChatNavigationProvider";

export default function InboxPage() {
	const isChatOpen = useChatNavigationStore((state) => state.isChatOpen);

	return (
		<div className="h-screen p-0 sm:p-2 w-screen md:w-full">
			<div className="flex gap-2">
				{/* Email List */}
				<EmailList />
				{/* Email Content */}
				<EmailContent />

				{isChatOpen && <ChatSidebar />}
      </div>
		</div>
	);
}
