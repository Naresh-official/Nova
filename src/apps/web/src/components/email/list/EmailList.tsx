"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { ThreadResponse, DraftResponse } from "@nova/server/types";
import { trpc } from "@/lib/client";
import EmailNode from "./EmailNode";
import DraftNode from "./DraftNode";
import { LoaderCircle } from "lucide-react";
import { Skeleton } from "@nova/ui/components/skeleton";
import { useQueryStore } from "@/components/providers/QueryStoreProvider";
import { useRefreshStore } from "@/components/providers/RefreshStoreProvider";
import { NovaHeader } from "@/components/header/NovaHeader";

function EmailList() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const utils = trpc.useUtils();
	const query = useQueryStore((state) => state.query);
	const isRefreshing = useRefreshStore((state) => state.isRefreshing);
	const labelIds = useQueryStore((state) => state.labelIds);

	const folder = pathname.split("/").pop() || "";

	const {
		data: threadsData,
		isLoading: isThreadsLoading,
		error,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = trpc.threads.listThreads.useInfiniteQuery(
		{
			q: query || undefined,
			labelIds,
			folder,
		},
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
			enabled: folder !== "drafts",
		}
	);

	const { data: drafts, isLoading: isDraftsLoading } =
		trpc.drafts.listDrafts.useQuery(undefined, {
			enabled: folder === "drafts",
		});

	const emails = threadsData?.pages.flatMap((page) => page.emails) || [];
	const isLoading = folder === "drafts" ? isDraftsLoading : isThreadsLoading;

	const [selectedEmail, setSelectedEmail] = useState<ThreadResponse>();
	const [selectedDraft, setSelectedDraft] = useState<DraftResponse>();

	// Infinite scroll observer
	const observer = useRef<IntersectionObserver | null>(null);
	const lastEmailRef = useCallback(
		(node: HTMLDivElement | null) => {
			if (isLoading || isFetchingNextPage || !node) return;
			if (observer.current) observer.current.disconnect();

			observer.current = new IntersectionObserver((entries) => {
				if (entries[0].isIntersecting && hasNextPage) {
					fetchNextPage();
				}
			});

			observer.current.observe(node);
		},
		[isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]
	);

	useEffect(() => {
		if (folder !== "drafts" && emails.length > 0) {
			const threadId = searchParams.get("threadId");
			if (threadId) {
				const emailFromParams = emails.find((email) => email.id === threadId);
				setSelectedEmail(emailFromParams);
			} else {
				setSelectedEmail(undefined);
			}
		}
	}, [emails, searchParams, folder]);

	const handleEmailSelect = (email: ThreadResponse) => {
		setSelectedEmail(email);

		const newSearchParams = new URLSearchParams(searchParams);
		newSearchParams.set("threadId", email.id);
		router.push(`${pathname}?${newSearchParams.toString()}`);

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

	const handleDraftSelect = (draft: DraftResponse) => {
		setSelectedDraft(draft);
	};

	useEffect(() => {
		if (error && error.data?.code === "UNAUTHORIZED") {
			router.push("/login");
		}
	}, [error, router]);

	const renderLoadingSkeleton = () => (
		<div className="space-y-3 p-4">
			{Array.from({ length: 10 }).map((_, index) => (
				<div key={index} className="flex items-start space-x-3 p-3">
					<Skeleton className="h-10 w-10 rounded-full" />
					<div className="space-y-2 flex-1">
						<Skeleton className="h-4 w-3/4" />
						<Skeleton className="h-3 w-full" />
					</div>
					<Skeleton className="h-3 w-12" />
				</div>
			))}
		</div>
	);

	const renderDraftsContent = () => {
		if (!drafts || drafts.length === 0) {
			return (
				<div className="flex items-center justify-center h-full text-gray-400">
					No drafts found
				</div>
			);
		}

		return drafts.map((draft) => (
			<DraftNode
				key={draft.id}
				draft={draft}
				selectedDraftId={selectedDraft?.id}
				onSelect={handleDraftSelect}
			/>
		));
	};

	const renderEmailsContent = () => {
		if (emails.length === 0) {
			return (
				<div className="flex items-center justify-center h-full text-gray-400">
					No emails found
				</div>
			);
		}

		return (
			<>
				{emails.map((email) => (
					<EmailNode
						key={email.id}
						email={email}
						selectedEmail={selectedEmail}
						setSelectedEmail={handleEmailSelect}
						ref={
							email?.id === emails?.[emails.length - 3]?.id
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
		);
	};

	const renderContent = () => {
		if (isLoading || isRefreshing) {
			return renderLoadingSkeleton();
		}

		if (folder === "drafts") {
			return renderDraftsContent();
		}

		return renderEmailsContent();
	};

	return (
		<div className="w-[420px] bg-black rounded-lg">
			<NovaHeader />
			<div className="scroll-container h-[calc(100vh-80px)] px-2">
				{renderContent()}
			</div>
		</div>
	);
}

export default EmailList;
