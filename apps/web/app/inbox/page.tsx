"use client";

import { useEffect, useState } from "react";
import EmailList from "@/components/EmailList";
import EmailContent from "@/components/EmailContent";
import type { TRPCThreadResponse } from "@nova/server/types";
import { trpc } from "@/lib/client";

export default function InboxPage() {
	const {
		data: emails,
		isLoading,
		error,
	} = trpc.threads.listThreads.useQuery();

	const [selectedEmail, setSelectedEmail] = useState<
		TRPCThreadResponse | undefined
	>(undefined);

	useEffect(() => {
		if (emails && emails.length > 0 && !selectedEmail) {
			setSelectedEmail(emails[0]);
		}
	}, [emails, selectedEmail]);

	if (isLoading) {
		return (
			<div className="flex h-screen w-96 flex-1 items-center justify-center">
				<div className="text-white">Loading emails...</div>
			</div>
		);
	}
	return (
		<div className="flex h-screen p-2 w-full">
			<div className="flex-1 flex gap-2">
				{/* Email List */}

				<EmailList
					emails={emails || []}
					selectedEmail={selectedEmail}
					setSelectedEmail={setSelectedEmail}
				/>
				{/* Email Content */}
				<EmailContent threadId={selectedEmail?.id} />
			</div>
		</div>
	);
}
