import type { IEmail } from "gmail-api-parse-message-ts";
import React, { useState } from "react";
import SenderInfo from "./SenderInfo";
import { useStream } from "@/hooks/useStream";
import { useSession } from "next-auth/react";
import EmailBodyDisplay from "./EmailBodyDisplay";
import {
	preprocessEmailHtml,
	processEmailHtml,
} from "../utils/processEmailContent";

interface EmailMessageProps {
	message: IEmail;
	attachments:
		| Array<{
				filename: string;
				mimeType: string;
				data: string;
				size: number;
				src: string;
		  }>
		| undefined;
}

function EmailMessage({ message, attachments }: EmailMessageProps) {
	const [showContent, setShowContent] = useState(false);

	const { data: session } = useSession();
	const {
		data: summaryData,
		start: startSummaryStream,
		stop,
		isStreaming,
		error: summaryError,
		reset,
	} = useStream(`/ai/summarize-email`);

	const rawHtml = preprocessEmailHtml(message.textHtml);

	const { processedHtml: html } = processEmailHtml({
		html: rawHtml,
		shouldLoadImages: true,
		inlineAttachments: attachments || [],
		messageId: message.id || "",
	});

	const imageAttachments = attachments?.filter((attachment) =>
		attachment.mimeType.startsWith("image/")
	);

	const getRecipientText = () => {
		if (message.to?.[0]?.email === session?.user?.email) return "You";
		return (
			message.to?.[0]?.name || message.to?.[0]?.email || "Unknown Recipient"
		);
	};

	return (
		<div className="border-b-2">
			<SenderInfo
				onClick={() => setShowContent(!showContent)}
				sender={{
					name: message.from?.name || message.from?.email || "Unknown Sender",
					initial:
						message.from?.name?.charAt(0) ||
						message.from?.email?.charAt(0) ||
						"U",
					email: message.from?.email || "",
				}}
				recipient={getRecipientText()}
				recipientEmail={message.to?.[0]?.email || ""}
				date={message.sentDate as number}
				isPersonal={message.labelIds.includes("CATEGORY_PERSONAL") || false}
				startSummaryStream={startSummaryStream}
				isStreaming={isStreaming}
				summaryData={summaryData}
				subject={message.subject || ""}
				emailBody={message.textHtml || message.textPlain || ""}
				summaryError={summaryError}
			/>
			<EmailBodyDisplay
				processedHtml={html}
				plainText={message.textPlain || ""}
        imageAttachments={imageAttachments}
        showContent={showContent}
			/>
		</div>
	);
}

export default EmailMessage;
