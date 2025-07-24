import React, { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import {
	formatDateString,
	formatTimeString,
	getDomainFromEmail,
} from "@/lib/parsers";
import { Button } from "@nova/ui/components/button";
import Image from "next/image";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@nova/ui/components/dropdown-menu";

interface SenderInfoProps {
	sender: {
		name: string;
		initial: string;
		email: string;
	};
	recipient: string;
	recipientEmail: string;
	date: number;
	isPersonal: boolean;
}

function SenderInfo({
	sender,
	recipient,
	recipientEmail,
	date,
	isPersonal = false,
}: SenderInfoProps) {
	const [imageError, setImageError] = useState(false);

	return (
		<div className="flex items-start justify-between p-4 rounded-lg">
			<div className="flex items-center gap-3">
				{/* Avatar */}
				<div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-zinc-600 rounded-full overflow-hidden text-xl font-medium text-zinc-200">
					{sender.email && !imageError && !isPersonal ? (
						<Image
							src={`https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${getDomainFromEmail(sender.email)}&size=48`}
							alt={sender.name}
							height={40}
							width={40}
							className="rounded-full"
							onError={() => setImageError(true)}
						/>
					) : (
						<span>{sender.initial}</span>
					)}
				</div>

				{/* Sender and Recipient Info */}
				<div className="flex flex-col">
					<div className="flex items-center gap-2">
						<span className="font-bold text-zinc-100">
							{sender.name}
						</span>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<a className="text-xs text-muted-foreground hover:underline hover:underline-offset-4">
									Details
								</a>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="flex items-center gap-2 p-2 bg-secondary">
								<div className="flex flex-col items-end text-sm text-zinc-400">
									<span>From : </span>
									<span>To : </span>
									<span>Reply to : </span>
									<span>Date : </span>
									<span>Mailed-BY : </span>
									<span>Signed-BY : </span>
								</div>
								<div className="flex flex-col text-sm text-zinc-200">
									<span>
										<span className="font-bold">
											{sender.name}{" "}
										</span>
										{sender.email}
									</span>
									<span>{recipientEmail}</span>
									<span>{sender.email}</span>
									<span>{formatDateString(date)}</span>
									<span>{sender.email}</span>
									<span>{sender.email}</span>
								</div>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
					<span className="text-sm text-zinc-400">
						To: {recipient}
					</span>
				</div>
			</div>

			{/* Timestamp and Options */}
			<div className="flex items-center gap-2 text-sm text-zinc-400">
				<div className="flex flex-col text-sm items-end">
					<span>{formatDateString(date)}</span>
					<span>{formatTimeString(date)}</span>
				</div>
				<Button variant="ghost">
					<MoreHorizontal size={20} />
				</Button>
			</div>
		</div>
	);
}

export default SenderInfo;
