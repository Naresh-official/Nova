"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { ThreadResponse } from "@server/types";
import { trpc } from "@/lib/client";
import { useQueryStore } from "@/components/providers/QueryStoreProvider";

export function useEmailSelection(emails: ThreadResponse[], folder: string) {
	const searchParams = useSearchParams();
	const utils = trpc.useUtils();
	const query = useQueryStore((state) => state.query);
	const labelIds = useQueryStore((state) => state.labelIds);

	const [selectedEmail, setSelectedEmail] = useState<ThreadResponse>();

	// Set selected email from URL params
	useEffect(() => {
		if (emails.length > 0) {
			const threadId = searchParams.get("threadId");
			const emailFromParams = threadId
				? emails.find((email) => email.id === threadId)
				: undefined;
			setSelectedEmail(emailFromParams);
		}
	}, [emails, searchParams]);

	const handleEmailSelect = (email: ThreadResponse) => {
		setSelectedEmail(email);

		// Mark as read if unread
		if (email.isUnread) {
			utils.threads.listThreads.setInfiniteData(
				{ q: query || undefined, labelIds, folder },
				(oldData) => {
					if (!oldData) return oldData;
					return {
						...oldData,
						pages: oldData.pages.map((page) => ({
							...page,
							emails: page.emails.map((thread) =>
								thread.id === email.id ? { ...thread, isUnread: false } : thread
							),
						})),
					};
				}
			);
		}
	};

	return { selectedEmail, handleEmailSelect };
}
