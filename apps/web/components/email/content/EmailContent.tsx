import { trpc } from "@/lib/client";
import React from "react";
import { ParseGmailApi } from "gmail-api-parse-message-ts";
import EmailActionBar from "./EmailActionBar";
import EmailMetaHeader from "./EmailMetaHeader";
import SenderInfo from "./SenderInfo";
import { useSession } from "next-auth/react";
import { Button } from "@nova/ui/components/button";
import { Forward, Reply, ReplyAll } from "lucide-react";
import { useSearchParams } from "next/navigation";
import EmptyState from "./EmptyState";
import { Separator } from "@nova/ui/components/separator";

function EmailContent() {
	const { data: session } = useSession();
	const searchParams = useSearchParams();
	const threadId = searchParams.get("threadId");

	const {
		data: thread,
		isLoading,
		error,
	} = trpc.threads.getThread.useQuery(threadId!, {
		enabled: !!threadId,
	});

	const MessageParser = new ParseGmailApi();
	const parsed = MessageParser.parseMessage(thread?.messages?.[0] || {});

	const getRecipientText = () => {
		if (parsed.to?.[0]?.email === session?.user?.email) {
			return "You";
		}
		return parsed.to?.[0]?.name || "Unknown Recipient";
	};

	if (isLoading) {
		return (
			<div className="flex-1 flex items-center justify-center text-gray-500">
				Loading...
			</div>
		);
	}

	if (!threadId) {
		return (
			<div className="flex-1 bg-black flex flex-col rounded-lg scroll-container h-[calc(100vh-18px)]">
				<EmptyState />
			</div>
		);
	}

	return (
		<div className="flex-1 bg-black flex flex-col rounded-lg scroll-container h-[calc(100vh-18px)]">
			<EmailActionBar />
			<EmailMetaHeader
				tags={parsed.labelIds}
				subject={parsed.subject}
				initial={
					parsed.from?.name?.charAt(0) ||
					parsed.from?.email?.charAt(0) ||
					"U"
				}
				name={
					parsed.from?.name || parsed.from?.email || "Unknown Sender"
				}
				email={parsed.from?.email || ""}
			/>
			<Separator />
			<SenderInfo
				sender={{
					name:
						parsed.from?.name ||
						parsed.from?.email ||
						"Unknown Sender",
					initial:
						parsed.from?.name?.charAt(0) ||
						parsed.from?.email?.charAt(0) ||
						"U",
					email: parsed.from?.email || "",
				}}
				recipient={getRecipientText()}
				recipientEmail={parsed.to?.[0]?.email || ""}
				date={parsed.sentDate}
				isPersonal={parsed.labelIds.includes("CATEGORY_PERSONAL")}
			/>
			<div className="rounded-lg p-4">
				<div
					style={{
						all: "unset",
						display: "block",
						color: "initial",
						fontFamily: "initial",
						fontSize: "initial",
						lineHeight: "initial",
						backgroundColor: "white",
						overflow: "hidden",
						borderRadius: "0.5rem",
						padding: "1rem",
					}}
					dangerouslySetInnerHTML={{
						__html: extractBodyContent(parsed.textHtml || ""),
					}}
				/>
			</div>
			<div className="flex items-center gap-2 p-4">
				<Button variant="secondary">
					<Reply size={20} />
					Reply
				</Button>
				<Button variant="secondary">
					<ReplyAll size={20} />
					Reply All
				</Button>
				<Button variant="secondary">
					<Forward size={20} />
					Forward
				</Button>
			</div>
		</div>
	);
}

export default EmailContent;

const extractBodyContent = (htmlString: string) => {
	const bodyMatch = htmlString.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
	return bodyMatch ? bodyMatch[1] : htmlString;
};
