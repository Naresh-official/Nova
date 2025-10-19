import { useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

export function useChatNavigation() {
	const [isExpanded, setIsExpanded] = useState(false);
	const [isPoppedOut, setIsPoppedOut] = useState(false);
	const router = useRouter();
	const searchParams = useSearchParams();

	const closeChat = () => {
		setIsPoppedOut(false);
		setIsExpanded(false);

		const params = new URLSearchParams(searchParams?.toString() || "");
		params.delete("isChatOpen");
		router.push(params.toString() ? `?${params}` : window.location.pathname);
	};

	const toggleExpand = () => setIsExpanded((prev) => !prev);
	const togglePoppedOut = () => setIsPoppedOut((prev) => !prev);
	const startNewChat = () => {};

	return {
		isExpanded,
		isPoppedOut,
		closeChat,
		toggleExpand,
		togglePoppedOut,
		startNewChat,
	};
}
