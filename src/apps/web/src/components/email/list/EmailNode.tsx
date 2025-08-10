import React, { useState } from "react";
import { formatDate } from "date-fns";
import type { ThreadResponse } from "@nova/server/types";
import {
	extractSenderEmail,
	extractSenderName,
	getDomainFromEmail,
} from "@/lib/parsers";
import Image from "next/image";
import { Star } from "lucide-react";
import { trpc } from "@/lib/client";

interface EmailNodeProps {
	email: ThreadResponse;
	selectedEmail: ThreadResponse | undefined;
	setSelectedEmail: (email: ThreadResponse) => void;
}

function EmailNodeBase(
	{ email, selectedEmail, setSelectedEmail }: EmailNodeProps,
	ref: React.Ref<HTMLDivElement>
) {
	const utils = trpc.useUtils();
	const labels = utils.labels.getLabels.getData()?.customLabels;

	const [imageError, setImageError] = useState(false);

	const senderName = extractSenderName(email.sender);
	const senderInitial = senderName[0].toUpperCase();
	const senderDomain = getDomainFromEmail(extractSenderEmail(email.sender));

	return (
		<div
			ref={ref}
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
						<span className="text-muted-foreground">{senderInitial}</span>
					)}
				</div>

				<div className="flex-1 min-w-0">
					<div className="flex items-center justify-between mb-1">
						<div className="text-sm flex items-center">
							<span
								className={`flex ${
									email.isUnread
										? "text-white font-extrabold"
										: "text-muted-foreground"
								}`}
							>
								<span className="max-w-56 truncate">{senderName}</span>
								{email.isStarred && (
									<Star
										size={16}
										className="ml-1 text-yellow-500"
										fill="yellow"
									/>
								)}
							</span>

							{email.isImportant && email.isUnread && (
								<div
									className="w-2 h-2 ml-2 rounded-full bg-blue-700"
									title="Important"
								/>
							)}
						</div>
						<span className="text-xs text-[#999]">
							{formatDate(email.date, "MMM dd, yyyy")}{" "}
						</span>
					</div>
					<div className="flex items-center justify-between">
						<h3 className="flex-1 text-sm mb-1 line-clamp-1 text-muted-foreground">
							{email.subject}
						</h3>
						{email.customLabels?.length > 0 && (
							<div className="flex flex-wrap gap-1">
								{email.customLabels.map((label) => {
									const customLabel = labels?.find((l) => l.id === label);
									return (
										<span
											key={label}
											className="text-xs px-2 py-1 rounded-full"
											style={{
												backgroundColor:
													customLabel?.color?.backgroundColor || "#333",
												color: customLabel?.color?.textColor || "#fff",
											}}
										>
											{customLabel?.name || "Custom Label"}
										</span>
									);
								})}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

const EmailNode = React.forwardRef(EmailNodeBase);

export default EmailNode;
