import { createStore } from "zustand";

export type ChatNavigationState = {
	isExpanded: boolean;
	isPoppedOut: boolean;
	isChatOpen: boolean;
};

export type ChatNavigationActions = {
	setIsExpanded: (isExpanded: boolean) => void;
	toggleExpand: () => void;
	setIsPoppedOut: (isPoppedOut: boolean) => void;
	togglePoppedOut: () => void;
	setIsChatOpen: (isChatOpen: boolean) => void;
	closeChat: () => void;
	startNewChat: () => void;
};

export type ChatNavigationStore = ChatNavigationState & ChatNavigationActions;

export const defaultInitState: ChatNavigationState = {
	isExpanded: false,
	isPoppedOut: false,
	isChatOpen: false,
};

export const createChatNavigationStore = (
	initState: ChatNavigationState = defaultInitState
) => {
	return createStore<ChatNavigationStore>()((set) => ({
		...initState,
		setIsExpanded: (isExpanded: boolean) => set({ isExpanded }),
		toggleExpand: () => set((state) => ({ isExpanded: !state.isExpanded })),
		setIsPoppedOut: (isPoppedOut: boolean) => set({ isPoppedOut }),
		togglePoppedOut: () =>
			set((state) => ({ isPoppedOut: !state.isPoppedOut })),
		setIsChatOpen: (isChatOpen: boolean) => set({ isChatOpen }),
		closeChat: () =>
			set({
				isPoppedOut: false,
				isExpanded: false,
				isChatOpen: false,
			}),
		startNewChat: () => set({ isChatOpen: true, isExpanded: true }),
	}));
};
