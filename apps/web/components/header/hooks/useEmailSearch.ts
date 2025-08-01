import { trpc } from "@/lib/client";
import { useState } from "react";

export function useEmailSearch() {
	const utils = trpc.useUtils();
	const [searchQuery, setSearchQuery] = useState<string>("");

	const handleRefresh = () => {
		utils.threads.listThreads.setInfiniteData({ q: searchQuery }, () => ({
			pages: [],
			pageParams: [],
		}));
		setSearchQuery("");
		utils.threads.listThreads.invalidate({ q: undefined });
	};

	const handleSearchEmails = async (query: string) => {
		setSearchQuery(query);

		utils.threads.listThreads.setInfiniteData({ q: undefined }, () => ({
			pages: [],
			pageParams: [],
		}));

		utils.threads.listThreads.invalidate({ q: query });

		const searchResults = await utils.threads.listThreads.fetchInfinite({
			q: query,
		});

		utils.threads.listThreads.setInfiniteData(
			{ q: undefined },
			() => searchResults
		);
	};

	return {
		handleRefresh,
		handleSearchEmails,
		searchQuery,
		setSearchQuery,
	};
}
