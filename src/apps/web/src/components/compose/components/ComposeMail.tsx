"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { trpc } from "@/lib/client";
import { convertToBase64 } from "../utils/convertToBase64";
import type { ComposeBodyFieldRef } from "./ComposeBodyField";

import { ComposeHeader } from "./ComposeHeader";
import { ComposeAddressFields } from "./ComposeAddressFields";
import { ComposeSubjectField } from "./ComposeSubjectField";
import { ComposeBodyField } from "./ComposeBodyField";
import { ComposeFooter } from "./ComposeFooter";
import { ParseGmailApi } from "gmail-api-parse-message-ts";

export function ComposeMail() {
	const utils = trpc.useUtils();
	const sendMessage = trpc.messages.sendMessage.useMutation();
	const saveDraft = trpc.drafts.saveDraft.useMutation({
		onSuccess: () => {
			utils.drafts.listDrafts.invalidate();
		},
		onError: () => {
			toast.error("Failed to save draft");
		},
	});
	const deleteDraft = trpc.drafts.deleteDraft.useMutation({
		onSuccess: () => {
			utils.drafts.listDrafts.invalidate();
			toast.success("Draft deleted!");
			closeCompose();
		},
		onError: () => {
			toast.error("Failed to delete draft");
		},
	});
	const { data: session } = useSession();

	const router = useRouter();
	const searchParams = useSearchParams();
	const draftId = searchParams.get("draftId");
	const { data: draft } = trpc.drafts.getDraft.useQuery(draftId!, {
		enabled: !!draftId,
	});

	const parsed = useMemo(() => {
		if (!draft?.message) return null;
		const parser = new ParseGmailApi();
		return parser.parseMessage(draft.message);
	}, [draft?.message]);

	const [to, setTo] = useState<string[]>([]);
	const [cc, setCc] = useState<string[]>([]);
	const [bcc, setBcc] = useState<string[]>([]);
	const [subject, setSubject] = useState("");
	const [body, setBody] = useState("");
	const [attachments, setAttachments] = useState<File[]>([]);
	const [isExpanded, setIsExpanded] = useState(false);
	const [isMinimized, setIsMinimized] = useState(false);

	useEffect(() => {
		if (!draftId || !parsed) return;

		setTo(parsed.to?.map((r) => r.email) || []);
		setCc(parsed.cc?.map((r) => r.email) || []);
		setBcc(parsed.bcc?.map((r) => r.email) || []);
		setSubject(parsed.subject || "");
		setBody(parsed.textHtml || "");
	}, [draftId, parsed]);

	const bodyFieldRef = useRef<ComposeBodyFieldRef>(null);

	const resetForm = () => {
		setTo([]);
		setCc([]);
		setBcc([]);
		setSubject("");
		setBody("");
		setAttachments([]);
	};

	const closeCompose = () => {
		setIsMinimized(false);
		setIsExpanded(false);

		const params = new URLSearchParams(searchParams?.toString() || "");
		params.delete("isComposeOpen");
		params.delete("draftId");
		router.push(params.toString() ? `?${params}` : window.location.pathname);
	};

	const handleImagesInsert = (base64Images: string[]) => {
		if (bodyFieldRef.current) {
			bodyFieldRef.current.insertMultipleImages(base64Images);
		} else {
			const imageHtml = base64Images
				.map(
					(src) =>
						`<p><img src="${src}" alt="Inserted image" class="max-w-full h-auto rounded-md my-2" /></p>`
				)
				.join("");
			setBody((prev) => prev + imageHtml);
		}
	};

	const handleSend = async () => {
		if (!to.length) {
			toast.error("Please add at least one recipient");
			return;
		}

		try {
			const preparedAttachments = await Promise.all(
				attachments.map(async (file) => ({
					filename: file.name,
					mimeType: file.type,
					data: await convertToBase64(file),
				}))
			);

			const toastId = toast.loading("Sending email...");
			await sendMessage.mutateAsync({
				senderName: session?.user?.name || "Nova User",
				to,
				cc,
				bcc,
				subject,
				body,
				attachments: preparedAttachments,
			});
			toast.dismiss(toastId);
			toast.success("Email sent!");

			if (draftId) {
				await deleteDraft.mutateAsync(draftId);
			}

			resetForm();
			closeCompose();
		} catch (err) {
			console.error(err);
			toast.error("Failed to send email");
		}
	};

	const handleSaveDraft = async () => {
		try {
			if (
				!to.length &&
				!cc.length &&
				!bcc.length &&
				!subject &&
				!body &&
				!attachments.length
			) {
				closeCompose();
				return;
			}

			const preparedAttachments = await Promise.all(
				attachments.map(async (file) => ({
					filename: file.name,
					mimeType: file.type,
					data: await convertToBase64(file),
				}))
			);

			const toastId = toast.loading("Saving draft...");
			await saveDraft.mutateAsync({
				senderName: session?.user?.name || "Nova User",
				to,
				cc,
				bcc,
				subject,
				body,
				attachments: preparedAttachments,
				draftId: draftId || undefined,
			});
			toast.dismiss(toastId);
			toast.success("Draft saved!");
			closeCompose();
		} catch (err) {
			console.error(err);
			toast.error("Failed to save draft");
		}
	};

	const handleDelete = async () => {
		if (draftId) {
			// Delete the draft from server
			try {
				const toastId = toast.loading("Deleting draft...");
				await deleteDraft.mutateAsync(draftId);
				toast.dismiss(toastId);
			} catch (err) {
				console.error(err);
			}
		} else {
			// Just clear state and close
			resetForm();
			closeCompose();
		}
	};

	const dialogClasses = isExpanded
		? "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[80vh] bg-[#1a1a1a] border border-[#2A2A2A] rounded-lg shadow-2xl z-50"
		: "fixed bottom-2 right-1/2 translate-x-1/2 lg:right-4 lg:translate-x-0 w-[95%] sm:w-[500px] bg-[#1a1a1a] border border-[#2A2A2A] rounded-lg shadow-2xl z-50";

	return (
		<>
			{isExpanded && (
				<div
					onClick={handleSaveDraft}
					className="fixed inset-0 bg-black/90 z-40"
				/>
			)}
			<div className={dialogClasses}>
				<ComposeHeader
					isExpanded={isExpanded}
					isMinimized={isMinimized}
					onClose={handleSaveDraft}
					onMinimize={() => setIsMinimized(true)}
					onHeaderClick={() => setIsMinimized(false)}
					toggleExpand={() => setIsExpanded((prev) => !prev)}
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
							<ComposeSubjectField subject={subject} setSubject={setSubject} />
							<ComposeBodyField
								ref={bodyFieldRef}
								body={body}
								setBodyAction={setBody}
							/>

							{/* Attachments */}
							{attachments.length > 0 && (
								<div className="px-3 py-2 border-t border-[#2A2A2A] text-sm text-white space-y-1">
									<p className="text-white/70 font-medium">Attachments:</p>
									<ul>
										{attachments.map((file, i) => (
											<li
												key={i}
												className="flex justify-between items-center bg-[#292929] px-3 py-1 rounded-md"
											>
												<span className="truncate max-w-[80%]">
													{file.name}
												</span>
												<button
													className="text-red-400 hover:text-red-600 text-xs"
													onClick={() =>
														setAttachments((prev) =>
															prev.filter((_, idx) => idx !== i)
														)
													}
												>
													Remove
												</button>
											</li>
										))}
									</ul>
								</div>
							)}
						</div>
						<ComposeFooter
							handleSend={handleSend}
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
