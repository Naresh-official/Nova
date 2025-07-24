import React, { useState } from "react";
import { Badge } from "@nova/ui/components/badge";
import { formatDate } from "date-fns";
import type { ThreadResponse } from "@nova/server/types";
import {
	extractSenderEmail,
	extractSenderName,
	getDomainFromEmail,
} from "@/lib/parsers";
import Image from "next/image";

function EmailNode({
	email,
	selectedEmail,
	setSelectedEmail,
}: {
	email: ThreadResponse;
	selectedEmail: ThreadResponse | undefined;
	setSelectedEmail: (email: ThreadResponse) => void;
}) {
	const [imageError, setImageError] = useState(false);

	const senderName = extractSenderName(email.sender);
	const senderInitial = senderName[0].toUpperCase();
	const senderDomain = getDomainFromEmail(extractSenderEmail(email.sender));

	return (
		<div
			key={email.id}
			onClick={() => setSelectedEmail(email)}
			className={`p-4 my-2 cursor-pointer transition-all duration-300 hover:bg-[#111111] border-2 rounded-xl ${
				selectedEmail?.id === email.id
					? "bg-[#111111] border-primary"
					: "border-transparent"
			}`}
		>
			<div className="flex items-start gap-3">
				<div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 text-sm font-semibold overflow-hidden">
					{!imageError && !email.isPersonal ? (
						<Image
							src={`https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${senderDomain}&size=48`}
							alt={senderInitial}
							width={32}
							height={32}
							className="rounded-full"
							onError={() => setImageError(true)}
						/>
					) : (
						<span className="text-muted-foreground">
							{senderInitial}
						</span>
					)}
				</div>

				<div className="flex-1 min-w-0">
					<div className="flex items-center justify-between mb-1">
						<div className="text-sm flex items-center">
							<span
								className={`${
									email.isUnread
										? "text-white font-extrabold"
										: "text-muted-foreground"
								}`}
							>
								{senderName}
							</span>

							{email.isImportant && email.isUnread && (
								<Badge
									variant="secondary"
									className="text-xs ml-2 bg-orange-500/20 text-orange-400 border-orange-500/30"
								>
									Important
								</Badge>
							)}
						</div>
						<span className="text-xs text-[#999]">
							{formatDate(email.date, "MMM dd, yyyy")}{" "}
						</span>
					</div>
					<h3 className="text-sm mb-1 line-clamp-1 text-muted-foreground">
						{email.subject}
					</h3>
				</div>
			</div>
		</div>
	);
}

export default EmailNode;
