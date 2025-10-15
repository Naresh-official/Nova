"use client";

import { Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { trpc } from "@/lib/client";

import { ComposeHeader } from "./ComposeHeader";
import { ComposeAddressFields } from "./ComposeAddressFields";
import { ComposeSubjectField } from "./ComposeSubjectField";
import { ComposeBodyField } from "./ComposeBodyField";
import { ComposeFooter } from "./ComposeFooter";
import { ComposeAttachments } from "./ComposeAttachments";
import { useComposeForm } from "../hooks/useComposeForm";
import { useComposeActions } from "../hooks/useComposeActions";
import { useComposeNavigation } from "../hooks/useComposeNavigation";

function ComposeMailInner() {
	const { data: session } = useSession();
	const searchParams = useSearchParams();
	const draftId = searchParams.get("draftId");

	const { data: draft } = trpc.drafts.getDraft.useQuery(draftId!, {
		enabled: !!draftId,
	});

	const {
		isExpanded,
		isMinimized,
		closeCompose,
		toggleExpand,
		minimize,
		restore,
	} = useComposeNavigation();

	const {
		to,
		setTo,
		cc,
		setCc,
		bcc,
		setBcc,
		subject,
		setSubject,
		body,
		setBody,
		attachments,
		setAttachments,
		editor,
		resetForm,
		handleImagesInsert,
		isEmpty,
	} = useComposeForm(draft);

	const { handleSend, handleSaveDraft, handleDelete } = useComposeActions({
		draftId,
		onClose: closeCompose,
		resetForm,
	});

	const onSend = () => {
		handleSend({ to, cc, bcc, subject, body, attachments });
	};

	const onSaveDraft = () => {
		handleSaveDraft({
			to,
			cc,
			bcc,
			subject,
			body,
			attachments,
			isEmpty: isEmpty(),
		});
	};

	const dialogClasses = isExpanded
		? "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[80vh] bg-[#1a1a1a] border border-[#2A2A2A] rounded-lg shadow-2xl z-50"
		: "fixed bottom-2 right-1/2 translate-x-1/2 lg:right-4 lg:translate-x-0 w-[95%] sm:w-[600px] bg-[#1a1a1a] border border-[#2A2A2A] rounded-lg shadow-2xl z-50";

	return (
		<>
			{isExpanded && (
				<div onClick={onSaveDraft} className="fixed inset-0 bg-black/90 z-40" />
			)}
			<div className={dialogClasses}>
				<ComposeHeader
					isExpanded={isExpanded}
					isMinimized={isMinimized}
					onClose={onSaveDraft}
					onMinimize={minimize}
					onHeaderClick={restore}
					toggleExpand={toggleExpand}
				/>
				{!isMinimized && (
					<>
						<div className="flex flex-col h-[calc(100%-100px)]">
							<ComposeAddressFields
								to={to}
								setTo={setTo}
								cc={cc}
								setCc={setCc}
								bcc={bcc}
								setBcc={setBcc}
								userEmail={session?.user?.email}
								userName={session?.user?.name}
							/>
							<ComposeSubjectField
								subject={subject}
								setSubject={setSubject}
								body={editor?.getText() || ""}
							/>
							<ComposeBodyField
								editor={editor}
								senderName={session?.user?.name}
								senderEmail={session?.user?.email}
								recipientEmail={to?.[0] || ""}
								subject={subject}
							/>

							<ComposeAttachments
								attachments={attachments}
								onRemove={(index) =>
									setAttachments((prev) => prev.filter((_, i) => i !== index))
								}
							/>
						</div>
						<ComposeFooter
							handleSend={onSend}
							onFileSelect={(files) =>
								setAttachments((prev) => [...prev, ...files])
							}
							onImagesInsert={handleImagesInsert}
							onDelete={handleDelete}
						/>
					</>
				)}
			</div>
		</>
	);
}

export function ComposeMail() {
	return (
		<Suspense fallback={<div>Loading Compose Mail...</div>}>
			<ComposeMailInner />
		</Suspense>
	);
}
