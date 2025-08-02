"use client";

import { type ReactNode, createContext, useRef, useContext } from "react";
import { useStore } from "zustand";

import {
	type searchQueryStore,
	createSearchQueryStore,
} from "@/stores/search-store";

export type QueryStoreApi = ReturnType<typeof createSearchQueryStore>;

export const QueryStoreContext = createContext<QueryStoreApi | undefined>(
	undefined
);

export interface QueryStoreProviderProps {
	children: ReactNode;
}

export const QueryStoreProvider = ({ children }: QueryStoreProviderProps) => {
	const storeRef = useRef<QueryStoreApi | null>(null);
	if (storeRef.current === null) {
		storeRef.current = createSearchQueryStore();
	}

	return (
		<QueryStoreContext.Provider value={storeRef.current}>
			{children}
		</QueryStoreContext.Provider>
	);
};

export const useQueryStore = <T,>(
	selector: (store: searchQueryStore) => T
): T => {
	const queryStoreContext = useContext(QueryStoreContext);

	if (!queryStoreContext) {
		throw new Error(`useQueryStore must be used within QueryStoreProvider`);
	}

	return useStore(queryStoreContext, selector);
};
