import React from "react";
import {
	StarIcon,
	TagIcon,
	BellIcon,
	MessagesSquareIcon,
	ZapIcon,
	UserIcon,
	UsersIcon,
} from "lucide-react";

import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@nova/ui/components/tooltip";
import Image from "next/image";
import { getDomainFromEmail } from "@/lib/utils";
import { Separator } from "@nova/ui/components/separator";

interface EmailMetaHeaderProps {
	tags: string[];
	subject: string;
	initial: string;
	name: string;
	email: string;
}

function EmailMetaHeader({
	tags = [],
	subject,
	initial,
	name,
	email,
}: EmailMetaHeaderProps) {
	const Alltags = [
		{ name: "STARRED", icon: StarIcon, color: "bg-yellow-500" },
		{ name: "CATEGORY_PROMOTIONS", icon: TagIcon, color: "bg-pink-500" },
		{ name: "CATEGORY_UPDATES", icon: BellIcon, color: "bg-purple-500" },
		{ name: "Forums", icon: MessagesSquareIcon, color: "bg-blue-500" },
		{ name: "IMPORTANT", icon: ZapIcon, color: "bg-yellow-400" },
		{ name: "CATEGORY_PERSONAL", icon: UserIcon, color: "bg-green-500" },
		{ name: "CATEGORY_SOCIAL", icon: UsersIcon, color: "bg-pink-500" },
	];

	return (
		<div className="flex flex-col gap-4 p-4 rounded-lg">
			<h1 className="text-2xl text-zinc-100 font-semibold">{subject}</h1>

			<div className="flex items-center gap-2">
				<div className="flex items-center gap-2">
					{Alltags.filter((tag) => tags.includes(tag.name)).map(
						(tag) => (
							<Tooltip key={tag.name}>
								<TooltipTrigger>
									<div
										className={`flex items-center justify-center p-1.5 ${tag.color} rounded-md`}
									>
										<tag.icon
											size={16}
											className="text-white fill-white"
										/>
									</div>
								</TooltipTrigger>
								<TooltipContent>
									<p>{tag.name}</p>
								</TooltipContent>
							</Tooltip>
						)
					)}
					<div className="w-px h-6 bg-zinc-600 mx-1"></div>
				</div>
				<div className="flex items-center gap-2 p-2 pr-4 border border-zinc-600 rounded-full">
					<div className="flex items-center justify-center w-6 h-6 bg-secondary rounded-full">
						<Image
							src={`https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${getDomainFromEmail(email)}&size=48`}
							alt={initial}
							width={24}
							height={24}
							className="rounded-full"
						/>
					</div>
					<span className="text-sm text-zinc-200">{name}</span>
				</div>
			</div>
		</div>
	);
}

export default EmailMetaHeader;
