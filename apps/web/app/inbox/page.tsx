"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EmailList from "@/components/EmailList";
import EmailContent from "@/components/EmailContent";
import type { TRPCThreadResponse } from "@nova/server/types";
import { trpc } from "@/lib/client";

export default function InboxPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const utils = trpc.useUtils();
	const {
		data: emails,
		isLoading,
		error,
	} = trpc.threads.listThreads.useQuery();

	const [selectedEmail, setSelectedEmail] = useState<
		TRPCThreadResponse | undefined
	>(undefined);

	// Initialize selected email from URL search params
	useEffect(() => {
		if (emails && emails.length > 0) {
			const threadId = searchParams.get("threadId");
			if (threadId) {
				const emailFromParams = emails.find(
					(email) => email.id === threadId
				);
				if (emailFromParams) {
					setSelectedEmail(emailFromParams);
				}
			} else {
				setSelectedEmail(undefined);
			}
		}
	}, [emails, searchParams]);

	const handleEmailSelect = (email: TRPCThreadResponse) => {
		setSelectedEmail(email);

		router.push(`/inbox?threadId=${email.id}`);

		// If email is unread, mark it as read
		if (email.isUnread) {
			// update the local cache
			utils.threads.listThreads.setData(undefined, (oldData) => {
				if (!oldData) return oldData;
				return oldData.map((thread) =>
					thread.id === email.id
						? { ...thread, isUnread: false }
						: thread
				);
			});
		}
	};

	// Handle unauthorized errors by redirecting to login
	useEffect(() => {
		if (error && error.data?.code === "UNAUTHORIZED") {
			router.push("/login");
		}
	}, [error, router]);

	if (isLoading) {
		return (
			<div className="flex h-screen w-96 flex-1 items-center justify-center">
				<div className="text-white">Loading emails...</div>
			</div>
		);
	}
	return (
		<div className="h-screen p-2 w-full">
			<div className="flex gap-2">
				{/* Email List */}
				<EmailList
					emails={emails || []}
					selectedEmail={selectedEmail}
					setSelectedEmail={handleEmailSelect}
				/>
				{/* Email Content */}
				<EmailContent />
			</div>
		</div>
	);
}
