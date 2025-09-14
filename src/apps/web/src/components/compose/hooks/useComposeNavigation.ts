import { useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

export function useComposeNavigation() {
	const [isExpanded, setIsExpanded] = useState(false);
	const [isMinimized, setIsMinimized] = useState(false);
	const router = useRouter();
	const searchParams = useSearchParams();

	const closeCompose = () => {
		setIsMinimized(false);
		setIsExpanded(false);

		const params = new URLSearchParams(searchParams?.toString() || "");
		params.delete("isComposeOpen");
		params.delete("draftId");
		router.push(params.toString() ? `?${params}` : window.location.pathname);
	};

	const toggleExpand = () => setIsExpanded((prev) => !prev);
	const minimize = () => setIsMinimized(true);
	const restore = () => setIsMinimized(false);

	return {
		isExpanded,
		isMinimized,
		closeCompose,
		toggleExpand,
		minimize,
		restore,
	};
}
