"use client";

import { trpc } from "@/lib/client";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
import {
	preprocessEmailHtml,
	processEmailHtml,
} from "./utils/processEmailContent";
import { printEmail } from "./printEmail";

function EmailContent() {
	const { data: session } = useSession();
	const searchParams = useSearchParams();
	const threadId = searchParams.get("threadId");

	const { data: thread, isLoading } = trpc.threads.getThread.useQuery(
		threadId!,
		{
			enabled: !!threadId,
		}
	);

	const MessageParser = new ParseGmailApi();
	const parsed = MessageParser.parseMessage(thread?.messages?.[0] || {});
	console.log({ parsed });

	const hostRef = useRef<HTMLDivElement>(null);
	const shadowRootRef = useRef<ShadowRoot | null>(null);

	const [isClient, setIsClient] = useState(false);
	const [debugInfo, setDebugInfo] = useState({
		hasHtml: false,
		hasProcessedHtml: false,
		hasShadowRoot: false,
		injected: false,
	});

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
				theme: "dark",
				shouldLoadImages: true,
				inlineAttachments: parsed.attachments || [],
				messageId: parsed.id || "",
			});

			return html;
		} catch (error) {
			console.error("Error processing email HTML:", error);
			return null;
		}
	}, [parsed.textHtml, parsed.inline]);

	useEffect(() => {
		setDebugInfo((prev) => ({
			...prev,
			hasHtml: !!parsed.textHtml,
			hasProcessedHtml: !!processedHtml,
		}));
	}, [parsed.textHtml, processedHtml]);

	// Create and inject shadow DOM
	useEffect(() => {
		if (!isClient || !hostRef.current || !processedHtml) return;

		try {
			const shadowRoot =
				hostRef.current.shadowRoot ||
				hostRef.current.attachShadow({ mode: "open" });

			shadowRootRef.current = shadowRoot;
			setDebugInfo((prev) => ({ ...prev, hasShadowRoot: true }));

			// Build style manually
			const style = `
			::selection {
				background: #7f22fe !important;
				color: white !important;
			}

			*::selection {
				background: #7f22fe !important;
				color: white !important;
			}
		`;

			// Extract body content to avoid full HTML nesting
			const htmlContent = extractBodyContent(processedHtml);

			// Clear previous content
			shadowRoot.innerHTML = `
			<style>${style}</style>
			<div class="email-wrapper">${htmlContent}</div>
		`;

			setDebugInfo((prev) => ({ ...prev, injected: true }));
		} catch (error) {
			console.error("Error with shadow DOM:", error);
			setDebugInfo((prev) => ({ ...prev, injected: false }));
		}
	}, [isClient, processedHtml]);

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
			<div className="rounded-lg p-4 selectable-email-container">
				<div
					ref={hostRef}
					style={{
						display: "block",
						backgroundColor: "black",
						overflow: "hidden",
						borderRadius: "0.5rem",
						padding: "1rem",
						minHeight: "200px",
					}}
				/>

				{!debugInfo.injected && processedHtml && (
					<div
						className="mt-4 p-4 bg-black rounded-lg"
						dangerouslySetInnerHTML={{ __html: processedHtml }}
					/>
				)}
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
