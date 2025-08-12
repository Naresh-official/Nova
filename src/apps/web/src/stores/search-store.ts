import { createStore } from "zustand";
import { z } from "zod";

const allowedLabelIds = z.enum([
	"STARRED",
	"UNREAD",
	"IMPORTANT",
	"CATEGORY_PERSONAL",
	"CATEGORY_SOCIAL",
	"CATEGORY_UPDATES",
	"CATEGORY_FORUMS",
	"CATEGORY_PROMOTIONS",
]);

export type AllowedLabelId = z.infer<typeof allowedLabelIds>;

export type searchQueryState = {
	query: string;
	labelIds: AllowedLabelId[];
};

export type searchQueryActions = {
	setQuery: (query: string) => void;
	clearQuery: () => void;
	setLabelIds: (labelIds: AllowedLabelId[]) => void;
	addLabelId: (labelId: AllowedLabelId) => void;
	removeLabelId: (labelId: AllowedLabelId) => void;
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
		setLabelIds: (labelIds: AllowedLabelId[]) => {
			const validLabelIds = labelIds.filter(
				(id) => allowedLabelIds.safeParse(id).success
			);
			set({ labelIds: validLabelIds });
		},
		addLabelId: (labelId: AllowedLabelId) => {
			if (allowedLabelIds.safeParse(labelId).success) {
				set((state) => ({
					labelIds: state.labelIds.includes(labelId)
						? state.labelIds
						: [...state.labelIds, labelId],
				}));
			}
		},
		removeLabelId: (labelId: AllowedLabelId) =>
			set((state) => ({
				labelIds: state.labelIds.filter((id) => id !== labelId),
			})),
		clearLabelIds: () => set({ labelIds: [] }),
	}));
};
