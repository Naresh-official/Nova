"use client";

import React, { Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { trpc } from "@/lib/client";
import { useQueryStore } from "@/components/providers/QueryStoreProvider";
import EmailNode from "./EmailNode";
import LoadingSkeleton from "./LoadingSkeleton";
import EmptyState from "./EmptyState";
import InfiniteScrollLoader from "./InfiniteScrollLoader";
import { useEmailSelection } from "../hooks/useEmailSelection";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import type { ThreadResponse } from "@server/types";

interface EmailListContentProps {
	folder: string;
	isRefreshing: boolean;
}

export default function EmailListContent({
	folder,
	isRefreshing,
}: EmailListContentProps) {
	return (
		<Suspense fallback={<div>Loading emails...</div>}>
			<Content folder={folder} isRefreshing={isRefreshing} />
		</Suspense>
	);
}

function Content({ folder, isRefreshing }: EmailListContentProps) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const query = useQueryStore((state) => state.query);
	const labelIds = useQueryStore((state) => state.labelIds);

	const {
		data: threadsData,
		isLoading,
		error,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = trpc.threads.listThreads.useInfiniteQuery(
		{ q: query || undefined, labelIds, folder },
		{ getNextPageParam: (lastPage) => lastPage.nextCursor }
	);

	const emails = threadsData?.pages.flatMap((page) => page.emails) || [];
	const { selectedEmail, handleEmailSelect } = useEmailSelection(
		emails,
		folder
	);
	const { lastEmailRef } = useInfiniteScroll({
		isLoading,
		isFetchingNextPage,
		hasNextPage,
		fetchNextPage,
	});

	React.useEffect(() => {
		if (error?.data?.code === "UNAUTHORIZED") {
			router.push("/login");
		}
	}, [error, router]);

	const createEmailHref = (email: ThreadResponse) => {
		const newSearchParams = new URLSearchParams(searchParams);
		newSearchParams.set("threadId", email.id);
		return `${pathname}?${newSearchParams.toString()}`;
	};

	if (isLoading || isRefreshing) return <LoadingSkeleton />;
	if (emails.length === 0) return <EmptyState message="No emails found" />;

	return (
		<>
			{emails.map((email) => (
				<EmailNode
					key={email.id}
					email={email}
					selectedEmail={selectedEmail}
					setSelectedEmail={handleEmailSelect}
					href={createEmailHref(email)}
					ref={
						email?.id === emails?.[emails.length - 3]?.id
							? lastEmailRef
							: undefined
					}
				/>
			))}
			{isFetchingNextPage && <InfiniteScrollLoader />}
		</>
	);
}
