"use client";

import { type ReactNode, createContext, useRef, useContext } from "react";
import { useStore } from "zustand";

import { type refreshStore, createRefreshStore } from "@/stores/refresh-store";

export type RefreshStoreApi = ReturnType<typeof createRefreshStore>;

export const RefreshStoreContext = createContext<RefreshStoreApi | undefined>(
	undefined
);

export interface RefreshStoreProviderProps {
	children: ReactNode;
}

export const RefreshStoreProvider = ({
	children,
}: RefreshStoreProviderProps) => {
	const storeRef = useRef<RefreshStoreApi | null>(null);
	if (storeRef.current === null) {
		storeRef.current = createRefreshStore();
	}

	return (
		<RefreshStoreContext.Provider value={storeRef.current}>
			{children}
		</RefreshStoreContext.Provider>
	);
};

export const useRefreshStore = <T,>(
	selector: (store: refreshStore) => T
): T => {
	const refreshStoreContext = useContext(RefreshStoreContext);

	if (!refreshStoreContext) {
		throw new Error(`useRefreshStore must be used within RefreshStoreProvider`);
	}

	return useStore(refreshStoreContext, selector);
};
