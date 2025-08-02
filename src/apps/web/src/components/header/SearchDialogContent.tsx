import React, { useState, type Dispatch, type SetStateAction } from "react";
import DialogItem from "./DialogItem";
import { Input } from "@nova/ui/components/input";
import { useQueryStore } from "../providers/QueryStoreProvider";

interface SearchDialogContentProps {
	setDialogOpen: Dispatch<SetStateAction<boolean>>;
}

function SearchDialogContent({ setDialogOpen }: SearchDialogContentProps) {
	const { query, setQuery } = useQueryStore((state) => state);
	const [searchQuery, setSearchQuery] = useState<string>(query);
	return (
		<div className="space-y-1">
			<Input
				placeholder="Search emails..."
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						setQuery(searchQuery);
						setDialogOpen(false);
					}
				}}
				autoFocus
				className="border-0 focus-visible:ring-0 focus-visible:outline-0"
			/>
			<DialogItem text="Emails from John" onClick={() => {}} />
			<DialogItem text="Unread with attachments" onClick={() => {}} />
			<DialogItem text="Emails about meeting" onClick={() => {}} />
			<DialogItem text="Emails from December 2023" onClick={() => {}} />
		</div>
	);
}

export default SearchDialogContent;
