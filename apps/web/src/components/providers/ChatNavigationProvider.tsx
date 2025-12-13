"use client";

import { type ReactNode, createContext, useRef, useContext } from "react";
import { useStore } from "zustand";

import {
	type ChatNavigationStore,
	createChatNavigationStore,
} from "@/stores/chat-navigation-store";

export type ChatNavigationStoreApi = ReturnType<
	typeof createChatNavigationStore
>;

export const ChatNavigationStoreContext = createContext<
	ChatNavigationStoreApi | undefined
>(undefined);

export interface ChatNavigationProviderProps {
	children: ReactNode;
}

export const ChatNavigationProvider = ({
	children,
}: ChatNavigationProviderProps) => {
	const storeRef = useRef<ChatNavigationStoreApi | null>(null);
	if (storeRef.current === null) {
		storeRef.current = createChatNavigationStore();
	}

	return (
		<ChatNavigationStoreContext.Provider value={storeRef.current}>
			{children}
		</ChatNavigationStoreContext.Provider>
	);
};

export const useChatNavigationStore = <T,>(
	selector: (store: ChatNavigationStore) => T
): T => {
	const chatNavigationStoreContext = useContext(ChatNavigationStoreContext);

	if (!chatNavigationStoreContext) {
		throw new Error(
			`useChatNavigationStore must be used within ChatNavigationProvider`
		);
	}

	return useStore(chatNavigationStoreContext, selector);
};
