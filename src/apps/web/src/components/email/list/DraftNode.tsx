import React, { useState } from "react";
import { format } from "date-fns";
import Image from "next/image";
import {
	extractSenderEmail,
	extractSenderName,
	getDomainFromEmail,
} from "@/lib/parsers";
import type { DraftResponse } from "@nova/server/types";
interface DraftNodeProps {
	draft: DraftResponse;
	selectedDraftId?: string;
	onSelect: (draft: DraftResponse) => void;
}

function DraftNode({ draft, selectedDraftId, onSelect }: DraftNodeProps) {
	const [imageError, setImageError] = useState(false);

	const senderName = extractSenderName(draft.sender);
	const senderInitial = senderName[0]?.toUpperCase() || "?";
	const senderDomain = getDomainFromEmail(extractSenderEmail(draft.sender));

	return (
		<div
			onClick={() => onSelect(draft)}
			className={`p-4 my-2 cursor-pointer transition-all duration-300 hover:bg-[#111111] border-2 rounded-xl ${
				selectedDraftId === draft.id
					? "bg-[#111111] border-primary"
					: "border-transparent"
			}`}
		>
			<div className="flex items-start gap-3">
				<div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 text-sm font-semibold overflow-hidden">
					{!imageError ? (
						<Image
							src={`https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${senderDomain}&size=48`}
							alt={senderInitial}
							width={32}
							height={32}
							className="rounded-full"
							onError={() => setImageError(true)}
						/>
					) : (
						<span className="text-muted-foreground">{senderInitial}</span>
					)}
				</div>

				<div className="flex-1 min-w-0">
					<div className="flex items-center justify-between mb-1">
						<span className="text-sm text-white truncate max-w-[60%]">
							{senderName}
						</span>
						<span className="text-xs text-[#999]">
							{format(new Date(draft.date), "MMM dd, yyyy")}
						</span>
					</div>
					<div className="text-sm text-muted-foreground truncate">
						{draft.subject || "(No subject)"}
					</div>
				</div>
			</div>
		</div>
	);
}

export default DraftNode;
