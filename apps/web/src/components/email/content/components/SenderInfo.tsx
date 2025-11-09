import React, { useEffect, useState } from "react";
import {
	formatDateString,
	formatTimeString,
	getDomainFromEmail,
} from "@/lib/parsers";
import Image from "next/image";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@nova/ui/components/dropdown-menu";
import { ScrollText } from "lucide-react";
import { Button } from "@nova/ui/components/button";
import { Skeleton } from "@nova/ui/components/skeleton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

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
	startSummaryStream: ({}) => void;
	isStreaming: boolean;
	summaryData: string | null;
	subject: string;
	emailBody: string;
	summaryError?: Error | null;
	[key: string]: any;
}

function SenderInfo({
	sender,
	recipient,
	recipientEmail,
	date,
	isPersonal = false,
	startSummaryStream,
	isStreaming,
	summaryData,
	subject,
	emailBody,
	summaryError,
	...props
}: SenderInfoProps) {
	const [imageError, setImageError] = useState(false);

	const { data: session } = useSession();

	useEffect(() => {
		if (summaryError) {
			toast.error("Failed to enhance email", {
				description:
					summaryError.message || "An error occurred while enhancing the email",
			});
		}
	}, [summaryError]);

	return (
		<div className="flex items-start justify-between p-4 rounded-lg" {...props}>
			<div className="flex items-center gap-3">
				{/* Avatar */}
				<div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-zinc-600 rounded-full overflow-hidden text-xl font-medium text-zinc-200">
					{sender.email && !imageError && !isPersonal ? (
						<Image
							src={`https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${getDomainFromEmail(sender.email)}&size=48`}
							alt={
								sender.name === "Sender"
									? (session?.user?.name as string)
									: sender.name
							}
							height={40}
							width={40}
							className="rounded-full"
							onError={() => setImageError(true)}
						/>
					) : (
						<span>
							{sender.name === "Sender"
								? (session?.user?.name?.charAt(0) as string)
								: sender.name.charAt(0)}
						</span>
					)}
				</div>

				{/* Sender and Recipient Info */}
				<div className="flex flex-col">
					<div className="flex items-center gap-2">
						<span className="font-bold text-zinc-100">
							{sender.name === "Sender" ? "You" : sender.name}
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
										<span className="font-bold">{sender.name} </span>
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
					<span className="text-sm text-zinc-400">To: {recipient}</span>
				</div>
			</div>

			{/* Timestamp and Options */}
			<div className="flex items-center gap-2 text-sm text-zinc-400">
				<div className="flex flex-col text-sm items-end">
					<span>{formatDateString(date)}</span>
					<span>{formatTimeString(date)}</span>
				</div>

				<DropdownMenu
					onOpenChange={(open) => {
						if (open && !isStreaming && !summaryData) {
							startSummaryStream({
								sender: sender.name || sender.email,
								recipientEmail: recipientEmail,
								subject: subject,
								dateTime: new Date(date).toString(),
								emailBody: emailBody,
							});
						}
					}}
				>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							className="h-10"
							title="Summarize email"
							disabled={isStreaming}
						>
							<ScrollText size={30} className="min-w-6 min-h-6" />
						</Button>
					</DropdownMenuTrigger>

					<DropdownMenuContent className="mr-4">
						{isStreaming && !summaryData && (
							<div className="flex flex-col gap-2 p-2">
								<Skeleton className="h-6 w-md" />
								<Skeleton className="h-6 w-md" />
								<Skeleton className="h-6 w-md" />
								<Skeleton className="h-6 w-md" />
								<Skeleton className="h-6 w-md" />
								<Skeleton className="h-6 w-md" />
								<Skeleton className="h-6 w-md" />
							</div>
						)}

						{summaryData && (
							<div className="p-2 max-w-md text-sm text-zinc-200">
								<div className="flex flex-col">
									<ReactMarkdown
										remarkPlugins={[remarkGfm]}
										rehypePlugins={[rehypeRaw]}
										components={{
											h1: ({ node, ...props }) => (
												<h1 className="text-2xl font-bold mb-2" {...props} />
											),
											h2: ({ node, ...props }) => (
												<h2 className="text-xl font-semibold mb-2" {...props} />
											),
											h3: ({ node, ...props }) => (
												<h3 className="text-lg font-semibold mb-1" {...props} />
											),
											ul: ({ node, ...props }) => (
												<ul className="list-disc pl-5" {...props} />
											),
											ol: ({ node, ...props }) => (
												<ol className="list-decimal pl-5" {...props} />
											),
											li: ({ node, ...props }) => (
												<li className="mb-1" {...props} />
											),
											p: ({ node, ...props }) => (
												<p className="mb-2" {...props} />
											),
										}}
									>
										{summaryData}
									</ReactMarkdown>

									{isStreaming && (
										<div className="flex items-center m-2">
											<span className="flex space-x-1">
												<span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
												<span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
												<span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" />
											</span>
										</div>
									)}
								</div>
							</div>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}

export default SenderInfo;
