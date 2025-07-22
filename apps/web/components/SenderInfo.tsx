import React from "react";
import { MoreHorizontal } from "lucide-react";
import {
	formatDateString,
	formatTimeString,
	getDomainFromEmail,
} from "@/lib/utils";
import { Button } from "@nova/ui/components/button";
import Image from "next/image";

interface SenderInfoProps {
	sender: {
		name: string;
		initial: string;
		email: string;
	};
	recipient: string;
	date: number;
}

function SenderInfo({ sender, recipient, date }: SenderInfoProps) {
	return (
		<div className="flex items-start justify-between p-4 rounded-lg">
			<div className="flex items-center gap-3">
				{/* Avatar */}
				<div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-zinc-600 rounded-full">
					{sender.email ? (
						<Image
							src={`https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${getDomainFromEmail(sender.email)}&size=48`}
							alt={sender.name}
							height={40}
							width={40}
							className="rounded-full"
						/>
					) : (
						<span className="text-xl font-medium text-zinc-200">
							{sender.initial}
						</span>
					)}
				</div>

				{/* Sender and Recipient Info */}
				<div className="flex flex-col">
					<div className="flex items-center gap-2">
						<span className="font-bold text-zinc-100">
							{sender.name}
						</span>
						<a
							href="#"
							className="text-sm text-zinc-400 hover:underline"
						>
							Details
						</a>
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
