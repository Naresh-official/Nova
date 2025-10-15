import { useCallback, useRef } from "react";

interface UseInfiniteScrollProps {
	isLoading: boolean;
	isFetchingNextPage: boolean;
	hasNextPage: boolean | undefined;
	fetchNextPage: () => void;
}

export function useInfiniteScroll({
	isLoading,
	isFetchingNextPage,
	hasNextPage,
	fetchNextPage,
}: UseInfiniteScrollProps) {
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

	return { lastEmailRef };
}
