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

	const { data: threads } = trpc.threads.listThreads.useQuery();

	const currentThread = threads?.find((t) => t.id === threadId);

	const MessageParser = new ParseGmailApi();
	const parsed = MessageParser.parseMessage(thread?.messages?.[0] || {});
	console.log({ parsed });

	const getRecipientText = () => {
		if (parsed.to?.[0]?.email === session?.user?.email) {
			return "You";
		}
		return parsed.to?.[0]?.name || "Unknown Recipient";
	};

	const handlePrint = () => {
		// Create a hidden iframe for printing
		const iframe = document.createElement("iframe");
		iframe.style.position = "absolute";
		iframe.style.left = "-10000px";
		iframe.style.top = "-10000px";
		iframe.style.width = "0px";
		iframe.style.height = "0px";
		iframe.style.border = "none";

		document.body.appendChild(iframe);

		const printContent = `
			<!DOCTYPE html>
			<html>
			<head>
				<title>Print Email - ${parsed.subject || "No Subject"}</title>
				<style>
					body {
						font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
						line-height: 1.6;
						color: #333;
						max-width: 800px;
						margin: 0 auto;
						padding: 20px;
					}
					.email-header {
						border-bottom: 2px solid #eee;
						padding-bottom: 20px;
						margin-bottom: 20px;
					}
					.subject {
						font-size: 24px;
						font-weight: bold;
						margin-bottom: 10px;
					}
					.meta-info {
						color: #666;
						font-size: 14px;
						margin-bottom: 5px;
					}
					.email-content {
						margin-top: 20px;
					}
					@media print {
						body { margin: 0; }
					}
				</style>
			</head>
			<body>
				<div class="email-header">
					<div class="subject">${parsed.subject || "No Subject"}</div>
					<div class="meta-info"><strong>From:</strong> ${parsed.from?.name || parsed.from?.email || "Unknown Sender"} &lt;${parsed.from?.email || ""}&gt;</div>
					<div class="meta-info"><strong>To:</strong> ${getRecipientText()} &lt;${parsed.to?.[0]?.email || ""}&gt;</div>
					<div class="meta-info"><strong>Date:</strong> ${new Date(parsed.sentDate || "").toLocaleString()}</div>
				</div>
				<div class="email-content">
					${extractBodyContent(parsed.textHtml || "")}
				</div>
			</body>
			</html>
		`;

		const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
		if (iframeDoc) {
			iframeDoc.open();
			iframeDoc.write(printContent);
			iframeDoc.close();

			iframe.onload = () => {
				iframe.contentWindow?.focus();
				iframe.contentWindow?.print();
				// Remove iframe after printing
				setTimeout(() => {
					document.body.removeChild(iframe);
				}, 1000);
			};
		}
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
