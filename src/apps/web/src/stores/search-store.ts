import { createStore } from "zustand";
import { z } from "zod";

export type searchQueryState = {
	query: string;
	labelIds: string[];
};

export type searchQueryActions = {
	setQuery: (query: string) => void;
	clearQuery: () => void;
	setLabelIds: (labelIds: string[]) => void;
	addLabelId: (labelId: string) => void;
	removeLabelId: (labelId: string) => void;
	clearLabelIds: () => void;
};

export type searchQueryStore = searchQueryState & searchQueryActions;

export const defaultInitState: searchQueryState = {
	query: "",
	labelIds: [],
};

export const createSearchQueryStore = (
	initState: searchQueryState = defaultInitState
) => {
	return createStore<searchQueryStore>()((set) => ({
		...initState,
		setQuery: (query: string) => set({ query }),
		clearQuery: () => set({ query: "" }),
		setLabelIds: (labelIds: string[]) => {
			set({ labelIds });
		},
		addLabelId: (labelId: string) => {
			set((state) => ({
				labelIds: state.labelIds.includes(labelId)
					? state.labelIds
					: [...state.labelIds, labelId],
			}));
		},
		removeLabelId: (labelId: string) =>
			set((state) => ({
				labelIds: state.labelIds.filter((id) => id !== labelId),
			})),
		clearLabelIds: () => set({ labelIds: [] }),
	}));
};
