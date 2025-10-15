import React, { type SetStateAction } from "react";
import DialogItem from "./DialogItem";
import { Filter, Paperclip, Search, Mail, Star, Clock } from "lucide-react";

interface DefaultDialogContentProps {
	setCommandView: React.Dispatch<
		SetStateAction<"default" | "search" | "filterOptions">
	>;
}

function DefaultDialogContent({ setCommandView }: DefaultDialogContentProps) {
	return (
		<div className="flex flex-col items-center space-y-1">
			<DialogItem
				icon={<Search />}
				text="Search Emails"
				onClick={() => setCommandView("search")}
			/>
			<DialogItem
				icon={<Filter />}
				text="Filter Emails"
				onClick={() => setCommandView("filterOptions")}
			/>
			<DialogItem icon={<Mail />} text="Unread Emails" onClick={() => {}} />
			<DialogItem icon={<Star />} text="Starred Emails" onClick={() => {}} />
			<DialogItem
				icon={<Paperclip />}
				text="With Attachments"
				onClick={() => {}}
			/>
			<DialogItem icon={<Clock />} text="Last 7 Days" onClick={() => {}} />
		</div>
	);
}

export default DefaultDialogContent;
