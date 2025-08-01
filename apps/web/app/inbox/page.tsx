"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ThreadResponse } from "@nova/server/types";
import { trpc } from "@/lib/client";
import EmailList from "@/components/list/EmailList";
import EmailContent from "@/components/email/content/components/EmailContent";

export default function InboxPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const utils = trpc.useUtils();

	const {
		data,
		isLoading,
		error,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = trpc.threads.listThreads.useInfiniteQuery(
		{ q: undefined },
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
		}
	);

	const emails = data?.pages.flatMap((page) => page.emails) || [];

	const [selectedEmail, setSelectedEmail] = useState<
		ThreadResponse | undefined
	>(undefined);

	const observer = useRef<IntersectionObserver | null>(null);
	const lastEmailRef = useCallback(
		(node: HTMLDivElement | null) => {
			if (isLoading || isFetchingNextPage || !node) return;

			if (observer.current) {
				observer.current.disconnect();
			}

			observer.current = new IntersectionObserver((entries) => {
				if (entries[0].isIntersecting && hasNextPage) {
					console.log("Loading next page...");
					fetchNextPage();
				}
			});

			observer.current.observe(node);
		},
		[isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]
	);

	// Initialize selected email from URL search params
	useEffect(() => {
		if (emails && emails.length > 0) {
			const threadId = searchParams.get("threadId");
			if (threadId) {
				const emailFromParams = emails.find((email) => email.id === threadId);
				if (emailFromParams) {
					setSelectedEmail(emailFromParams);
				}
			} else {
				setSelectedEmail(undefined);
			}
		}
	}, [emails, searchParams]);

	const handleEmailSelect = (email: ThreadResponse) => {
		setSelectedEmail(email);

		router.push(`/inbox?threadId=${email.id}`);

		if (email.isUnread) {
			utils.threads.listThreads.setInfiniteData({ q: undefined }, (oldData) => {
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
			});
		}
	};

	useEffect(() => {
		if (error && error.data?.code === "UNAUTHORIZED") {
			router.push("/login");
		}
	}, [error, router]);

	if (isLoading) {
		return (
			<div className="flex bg-red-500 h-screen w-96 flex-1 items-center justify-center">
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
					lastEmailRef={lastEmailRef}
					isFetchingNextPage={isFetchingNextPage}
				/>
				{/* Email Content */}
				<EmailContent />
			</div>
		</div>
	);
}
