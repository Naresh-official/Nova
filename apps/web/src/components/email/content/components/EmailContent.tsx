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
import { useStream } from "@/hooks/useStream";
import EmailMessage from "./EmailMessage";

function EmailContentInner() {
	const { data: session } = useSession();
	const searchParams = useSearchParams();
	const threadId = searchParams.get("threadId");

	const { data, isLoading } = trpc.threads.getThread.useQuery(threadId!, {
		enabled: !!threadId,
	});

	const { thread, attachments } = data || {};

	const MessageParser = new ParseGmailApi();
	const emailMessages =
		thread?.messages?.map((message) => MessageParser.parseMessage(message)) ||
		[];

	const labelIds = new Set<string>();

	emailMessages.forEach((message) => {
		message.labelIds?.forEach((labelId) => labelIds.add(labelId));
	});

	const subject = emailMessages.at(-1)?.subject || "";

	const getRecipientText = () => {
		if (emailMessages[0].to?.[0]?.email === session?.user?.email) return "You";
		return (
			emailMessages[0].to?.[0]?.name ||
			emailMessages[0].to?.[0]?.email ||
			"Unknown Recipient"
		);
	};

	// TODO : update print to use library and to print all messages in thread
	const handlePrint = () => {
		printEmail(
			{ ...emailMessages[0], sentDate: String(emailMessages[0].sentDate) },
			getRecipientText()
		);
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
			<div className="hidden sm:flex-1 bg-black sm:flex flex-col rounded-lg scroll-container h-[calc(100vh-18px)]">
				<EmptyState />
			</div>
		);
	}

	return (
		<div className="absolute sm:static sm:flex sm:flex-1 bg-black flex-col rounded-lg scroll-container sm:h-[calc(100vh-18px)]">
			<EmailActionBar onPrint={handlePrint} />
			<EmailMetaHeader
				tags={labelIds}
				subject={subject}
				initial={
					emailMessages.at(-1)?.from?.name?.charAt(0) ||
					emailMessages.at(-1)?.from?.email?.charAt(0) ||
					"U"
				}
				name={
					emailMessages.at(-1)?.from?.name ||
					emailMessages.at(-1)?.from?.email ||
					"Unknown Sender"
				}
				email={emailMessages.at(-1)?.from?.email || ""}
			/>
			<Separator />

			{emailMessages.map((message, index) => (
				<EmailMessage key={index} message={message} attachments={attachments} />
			))}

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
