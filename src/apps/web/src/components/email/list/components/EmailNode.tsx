import React, { useState } from "react";
import { format, isToday } from "date-fns";
import Link from "next/link";
import type { ThreadResponse } from "@server/types";
import {
	extractSenderEmail,
	extractSenderName,
	getDomainFromEmail,
} from "@/lib/parsers";
import Image from "next/image";
import { Star } from "lucide-react";
import { trpc } from "@/lib/client";
import EmailContextMenu from "./EmailContextMenu";

interface EmailNodeProps {
	email: ThreadResponse;
	selectedEmail: ThreadResponse | undefined;
	setSelectedEmail: (email: ThreadResponse) => void;
	href: string;
}

function EmailNodeBase(
	{ email, selectedEmail, setSelectedEmail, href }: EmailNodeProps,
	ref: React.Ref<HTMLDivElement>
) {
	const utils = trpc.useUtils();
	const labels = utils.labels.getLabels.getData()?.customLabels;

	const [imageError, setImageError] = useState(false);

	const folder = href.split("/")[2].split("?")[0];

	const senderName = extractSenderName(email.sender);
	const senderInitial = senderName[0].toUpperCase();
	const senderDomain = getDomainFromEmail(extractSenderEmail(email.sender));
	const to = email.to;
	const toInitial = to ? to[0]?.toUpperCase() : "";

	const emailDate = new Date(email.date);
	const dateDisplay = isToday(emailDate)
		? format(emailDate, "h:mm a")
		: format(emailDate, "MMM dd, yyyy");

	return (
		<EmailContextMenu email={email}>
			<Link
				href={href}
				onClick={() => setSelectedEmail(email)}
				className={`block p-4 my-2 cursor-pointer transition-all duration-300 hover:bg-[#111111] border-2 rounded-xl ${
					selectedEmail?.id === email.id
						? "bg-[#111111] border-primary"
						: "border-transparent"
				}`}
			>
				<div ref={ref} className="flex items-start gap-3">
					<div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 text-sm font-semibold overflow-hidden">
						{!imageError && !email.isPersonal ? (
							<Image
								src={`https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${senderDomain}&size=48`}
								alt={folder === "sent" ? toInitial : senderInitial}
								width={32}
								height={32}
								className="rounded-full"
								onError={() => setImageError(true)}
							/>
						) : (
							<span className="text-muted-foreground">
								{folder === "sent" ? toInitial : senderInitial}
							</span>
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
									<span className="max-w-56 truncate">
										{folder === "sent" ? `To : ${to}` : senderName}
									</span>
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
							<span className="text-xs text-[#999]">{dateDisplay}</span>
						</div>
						<div className="flex items-center justify-between gap-2">
							<h3 className="flex-1 text-sm mb-1 line-clamp-1 text-muted-foreground">
								{email.subject || "(No Subject)"}
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
			</Link>
		</EmailContextMenu>
	);
}

const EmailNode = React.forwardRef(EmailNodeBase);

export default EmailNode;
