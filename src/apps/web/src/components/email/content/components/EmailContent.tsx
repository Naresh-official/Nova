"use client";

import { trpc } from "@/lib/client";
import React, { useEffect, useMemo, useState, Suspense } from "react";
import { ParseGmailApi } from "gmail-api-parse-message-ts";
import { useSession } from "next-auth/react";
import { Button } from "@nova/ui/components/button";
import { Forward, Reply, ReplyAll } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Separator } from "@nova/ui/components/separator";
import {
	preprocessEmailHtml,
	processEmailHtml,
} from "../utils/processEmailContent";
import { printEmail } from "../utils/printEmail";
import EmptyState from "./EmptyState";
import EmailActionBar from "./EmailActionBar";
import EmailMetaHeader from "./EmailMetaHeader";
import SenderInfo from "./SenderInfo";
import EmailAttachments from "./EmailAttachments";
import EmailBodyDisplay from "./EmailBodyDisplay";

function EmailContentInner() {
	const { data: session } = useSession();
	const searchParams = useSearchParams();
	const threadId = searchParams.get("threadId");

	const { data, isLoading } = trpc.threads.getThread.useQuery(threadId!, {
		enabled: !!threadId,
	});

	const { thread, attachments } = data || {};

	const MessageParser = new ParseGmailApi();
	const parsed = MessageParser.parseMessage(thread?.messages?.[0] || {});
	const imageAttachments = attachments?.filter((attachment) =>
		attachment.mimeType.startsWith("image/")
	);

	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	// Process email HTML
	const processedHtml = useMemo(() => {
		if (!parsed.textHtml) return null;

		try {
			const rawHtml = preprocessEmailHtml(parsed.textHtml);

			const { processedHtml: html } = processEmailHtml({
				html: rawHtml,
				shouldLoadImages: true,
				inlineAttachments: attachments || [],
				messageId: parsed.id || "",
			});

			return html;
		} catch (error) {
			console.error("Error processing email HTML:", error);
			return null;
		}
	}, [parsed.textHtml, attachments, parsed.id]);

	const getRecipientText = () => {
		if (parsed.to?.[0]?.email === session?.user?.email) return "You";
		return parsed.to?.[0]?.name || "Unknown Recipient";
	};

	const handlePrint = () => {
		printEmail(
			{ ...parsed, sentDate: String(parsed.sentDate) },
			getRecipientText()
		);
	};

	if (!isClient || isLoading) {
		return (
			<div className="flex-1 flex items-center justify-center text-gray-500">
				Loading...
			</div>
		);
	}

	if (!threadId) {
		return (
			<div className="hidden sm:flex-1 bg-black sm:flex flex-col rounded-lg scroll-container h-[calc(100vh-18px)]">
				<EmptyState />
			</div>
		);
	}

	return (
		<div className="absolute sm:static sm:flex sm:flex-1 bg-black flex-col rounded-lg scroll-container sm:h-[calc(100vh-18px)]">
			<EmailActionBar onPrint={handlePrint} />
			<EmailMetaHeader
				tags={parsed.labelIds}
				subject={parsed.subject}
				initial={
					parsed.from?.name?.charAt(0) || parsed.from?.email?.charAt(0) || "U"
				}
				name={parsed.from?.name || parsed.from?.email || "Unknown Sender"}
				email={parsed.from?.email || ""}
			/>
			<Separator />
			<SenderInfo
				sender={{
					name: parsed.from?.name || parsed.from?.email || "Unknown Sender",
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

			<EmailBodyDisplay
				processedHtml={processedHtml}
				plainText={parsed.textPlain}
				imageAttachments={imageAttachments}
			/>

			<EmailAttachments attachments={attachments} />

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

function EmailContent() {
	return (
		<Suspense
			fallback={
				<div className="flex-1 flex items-center justify-center text-gray-500">
					Loading email content...
				</div>
			}
		>
			<EmailContentInner />
		</Suspense>
	);
}

export default EmailContent;
