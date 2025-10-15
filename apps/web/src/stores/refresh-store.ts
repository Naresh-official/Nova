import { createStore } from "zustand";

export type refreshState = {
	isRefreshing: boolean;
};

export type refreshActions = {
	setRefreshing: (isRefreshing: boolean) => void;
};

export type refreshStore = refreshState & refreshActions;

export const defaultInitState: refreshState = {
	isRefreshing: false,
};

export const createRefreshStore = (
	initState: refreshState = defaultInitState
) => {
	return createStore<refreshStore>()((set) => ({
		...initState,
		setRefreshing: (isRefreshing: boolean) => set({ isRefreshing }),
	}));
};
