"use client";

import { useState } from "react";
import EmailList from "@/components/EmailList";
import EmailContent from "@/components/EmailContent";
import { client } from "@/lib/client";
import type { TRPCThreadResponse } from "@nova/server/types";

const emails = await client.threads.listThreads.query();
console.log({ emails });

export default function InboxPage() {
	const [selectedEmail, setSelectedEmail] = useState<
		TRPCThreadResponse | undefined
	>(emails[0]);

	return (
		<div className="flex h-screen p-2 w-full">
			<div className="flex-1 flex gap-2">
				{/* Email List */}

				<EmailList
					emails={emails}
					selectedEmail={selectedEmail}
					setSelectedEmail={setSelectedEmail}
				/>
				{/* Email Content */}
				{/* <EmailContent selectedEmail={selectedEmail} /> */}
			</div>
		</div>
	);
}
