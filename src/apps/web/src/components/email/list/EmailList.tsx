"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ThreadResponse } from "@nova/server/types";
import { trpc } from "@/lib/client";
import EmailNode from "./EmailNode";
import { LoaderCircle } from "lucide-react";
import { Skeleton } from "@nova/ui/components/skeleton";
import { useQueryStore } from "@/components/providers/QueryStoreProvider";
import { useRefreshStore } from "@/components/providers/RefreshStoreProvider";
import { NovaHeader } from "@/components/header/NovaHeader";

function EmailList() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const utils = trpc.useUtils();
	const query = useQueryStore((state) => state.query);
	const isRefreshing = useRefreshStore((state) => state.isRefreshing);
	const labelIds = useQueryStore((state) => state.labelIds);

	const {
		data,
		isLoading,
		error,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = trpc.threads.listThreads.useInfiniteQuery(
		{
			q: query || undefined,
			labelIds: labelIds,
		},
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
			utils.threads.listThreads.setInfiniteData(
				{ q: query || undefined, labelIds },
				(oldData) => {
					if (!oldData) return oldData;

					return {
						...oldData,
						pages: oldData.pages.map((page) => ({
							...page,
							emails: page.emails.map((thread) =>
								thread.id === email.id
									? {
											...thread,
											isUnread: false,
										}
									: thread
							),
						})),
					};
				}
			);
		}
	};

	useEffect(() => {
		if (error && error.data?.code === "UNAUTHORIZED") {
			router.push("/login");
		}
	}, [error, router]);

	return (
		<div className="w-[420px] bg-black rounded-lg">
			<NovaHeader />
			<div className="scroll-container h-[calc(100vh-80px)] px-2">
				{isLoading || isRefreshing ? (
					<div className="space-y-3 p-4">
						{Array.from({ length: 10 }).map((_, index) => (
							<div key={index} className="flex items-start space-x-3 p-3">
								<Skeleton className="h-10 w-10 rounded-full" />
								<div className="space-y-2 flex-1">
									<Skeleton className="h-4 w-3/4" />
									{/* <Skeleton className="h-3 w-1/2" /> */}
									<Skeleton className="h-3 w-full" />
								</div>
								<Skeleton className="h-3 w-12" />
							</div>
						))}
					</div>
				) : emails.length === 0 ? (
					<div className="flex items-center justify-center h-full">
						<div className="text-gray-400 text-center">
							<div className="text-lg text-gray-300 font-semibold mb-2">
								No emails found
							</div>
							<div className="text-sm">Your inbox is empty</div>
						</div>
					</div>
				) : (
					<>
						{emails.map((email) => (
							<EmailNode
								key={email.id}
								email={email}
								selectedEmail={selectedEmail}
								setSelectedEmail={handleEmailSelect}
								ref={
									email?.id === emails?.[emails.length - 3].id
										? lastEmailRef
										: undefined
								}
							/>
						))}
						{isFetchingNextPage && (
							<div className="flex justify-center items-center h-16">
								<LoaderCircle className="animate-spin" />
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}

export default EmailList;
