"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { DraftResponse } from "@server/types";
import { trpc } from "@/lib/client";
import DraftNode from "./DraftNode";
import LoadingSkeleton from "./LoadingSkeleton";
import EmptyState from "./EmptyState";

interface DraftListContentProps {
	isRefreshing: boolean;
}

function DraftListContentInner({ isRefreshing }: DraftListContentProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const [selectedDraft, setSelectedDraft] = useState<DraftResponse>();

	const { data: drafts, isLoading } = trpc.drafts.listDrafts.useQuery();

	useEffect(() => {
		const draftId = searchParams.get("draftId");

		if (!draftId) {
			setSelectedDraft(undefined);
			return;
		}

		if (drafts) {
			const draft = drafts.find((d) => d.id === draftId);
			setSelectedDraft(draft);
		}
	}, [searchParams, drafts]);

	const handleDraftSelect = (draft: DraftResponse) => {
		setSelectedDraft(draft);

		const newSearchParams = new URLSearchParams(searchParams);
		newSearchParams.set("draftId", draft.id);
		newSearchParams.set("isComposeOpen", "true");
		router.push(`${pathname}?${newSearchParams.toString()}`);
	};

	if (isLoading || isRefreshing) {
		return <LoadingSkeleton />;
	}

	if (!drafts || drafts.length === 0) {
		return <EmptyState message="No drafts found" />;
	}

	return (
		<>
			{drafts.map((draft) => (
				<DraftNode
					key={draft.id}
					draft={draft}
					selectedDraftId={selectedDraft?.id}
					onSelect={handleDraftSelect}
				/>
			))}
		</>
	);
}

function DraftListContent({ isRefreshing }: DraftListContentProps) {
	return (
		<Suspense fallback={<LoadingSkeleton />}>
			<DraftListContentInner isRefreshing={isRefreshing} />
		</Suspense>
	);
}

export default DraftListContent;
