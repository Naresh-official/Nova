"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ComposeHeader } from "./ComposeHeader";
import { ComposeAddressFields } from "./ComposeAddressFields";
import { ComposeSubjectField } from "./ComposeSubjectField";
import { ComposeBodyField } from "./ComposeBodyField";
import type { ComposeBodyFieldRef } from "./ComposeBodyField";
import { ComposeFooter } from "./ComposeFooter";
import { trpc } from "@/lib/client";
import { toast } from "sonner";
import { convertToBase64 } from "../utils/convertToBase64";

interface ImagePreview {
	id: string;
	src: string;
	name: string;
}

export function ComposeMail() {
	const sendMessage = trpc.messages.sendMessage.useMutation();
	const bodyFieldRef = useRef<ComposeBodyFieldRef>(null);
	const router = useRouter();
	const searchParams = useSearchParams();

	const { data: session } = useSession();
	const { email: userEmail, name: userName } = session?.user || {};

	const [to, setTo] = useState<string[]>([]);
	const [cc, setCc] = useState<string[]>([]);
	const [bcc, setBcc] = useState<string[]>([]);

	const [subject, setSubject] = useState("");
	const [body, setBody] = useState("");
	const [isExpanded, setIsExpanded] = useState(false);
	const [isMinimized, setIsMinimized] = useState(false);
	const [attachments, setAttachments] = useState<File[]>([]);
	const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);

	const onCloseAction = () => {
		setIsMinimized(false);
		setIsExpanded(false);

		const params = new URLSearchParams(searchParams?.toString() || "");
		params.delete("isComposeOpen");
		const newUrl = params.toString()
			? `?${params.toString()}`
			: window.location.pathname;
		router.push(newUrl);
	};

	const handleImagesInsert = (base64Images: string[]) => {
		const newPreviews: ImagePreview[] = base64Images.map((src, index) => ({
			id: Date.now() + index + "",
			src,
			name: `Image ${imagePreviews.length + index + 1}`,
		}));

		setImagePreviews((prev) => [...prev, ...newPreviews]);

		if (bodyFieldRef.current) {
			bodyFieldRef.current.insertMultipleImages(base64Images);
		} else {
			console.log(
				"bodyFieldRef.current is null, falling back to direct body update"
			);
			const imageHtml = base64Images
				.map(
					(src) =>
						`<p><img src="${src}" alt="Inserted image" class="max-w-full h-auto rounded-md my-2" /></p>`
				)
				.join("");
			setBody((prev) => `${prev}${imageHtml}`);
		}
	};

	const removeImagePreview = (id: string) => {
		setImagePreviews((prev) => prev.filter((img) => img.id !== id));
	};

	const handleSend = async () => {
		if (!to.length) {
			toast.error("Please add at least one recipient", {
				dismissible: true,
			});
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

			const loadingToastId = toast.loading("Sending email...", {
				dismissible: true,
			});

			await sendMessage.mutateAsync({
				senderName: userName || "Nova User",
				to,
				cc,
				bcc,
				subject,
				body,
				attachments: preparedAttachments,
			});

			toast.dismiss(loadingToastId);
			toast.success("Email sent!", {
				dismissible: true,
			});
			onCloseAction();
		} catch (err) {
			console.error(err);
			toast.error("Failed to send email", {
				dismissible: true,
			});
		}
	};

	const handleMinimize = () => {
		setIsMinimized(true);
		setIsExpanded(false);
	};

	const handleHeaderClick = () => {
		if (isMinimized) {
			setIsMinimized(false);
		}
	};

	const dialogClasses = isMinimized
		? "fixed bottom-2 right-1/2 translate-x-1/2 lg:right-4 lg:translate-x-0 w-[95%] sm:w-[500px] bg-[#1a1a1a] border border-[#2A2A2A] rounded-lg shadow-2xl z-50 transition-all duration-300 ease-in-out h-auto"
		: isExpanded
			? "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[90%] sm:h-[80vh] bg-[#1a1a1a] border border-[#2A2A2A] rounded-lg shadow-2xl z-50 transition-all duration-300 ease-in-out"
			: "fixed bottom-2 right-1/2 translate-x-1/2 lg:right-4 lg:translate-x-0 w-[95%] sm:w-[500px] bg-[#1a1a1a] border border-[#2A2A2A] rounded-lg shadow-2xl z-50 transition-all duration-300 ease-in-out";

	return (
		<>
			{isExpanded && (
				<div
					onClick={onCloseAction}
					className="fixed inset-0 bg-black/90 z-40"
				/>
			)}
			<div className={dialogClasses}>
				<ComposeHeader
					isExpanded={isExpanded}
					isMinimized={isMinimized}
					onClose={onCloseAction}
					onMinimize={handleMinimize}
					onHeaderClick={handleHeaderClick}
					toggleExpand={() => setIsExpanded((prev) => !prev)}
				/>
				{!isMinimized && (
					<>
						<div className="p-0 flex flex-col h-[calc(100%-100px)]">
							<ComposeAddressFields
								to={to}
								setTo={setTo}
								userEmail={userEmail}
								userName={userName}
								cc={cc}
								setCc={setCc}
								bcc={bcc}
								setBcc={setBcc}
							/>
							<ComposeSubjectField subject={subject} setSubject={setSubject} />
							<ComposeBodyField
								ref={bodyFieldRef}
								body={body}
								setBodyAction={setBody}
							/>

							{/* Image Previews Section */}
							{imagePreviews.length > 0 && (
								<div className="px-3 py-2 border-t border-[#2A2A2A] text-sm text-white space-y-2">
									<p className="text-white/70 font-medium">
										Images in email ({imagePreviews.length}):
									</p>
									<div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
										{imagePreviews.map((image) => (
											<div
												key={image.id}
												className="relative group bg-[#292929] rounded-md overflow-hidden"
											>
												<img
													src={image.src}
													alt={image.name}
													className="w-16 h-12 object-cover"
												/>
												<button
													className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
													onClick={() => removeImagePreview(image.id)}
													title="Remove image"
												>
													×
												</button>
											</div>
										))}
									</div>
								</div>
							)}

							{/* File Attachments Section */}
							{attachments.length > 0 && (
								<div className="px-3 py-2 border-t border-[#2A2A2A] text-sm text-white space-y-1">
									<p className="text-white/70 font-medium mb-1">Attachments:</p>
									<ul className="space-y-1">
										{attachments.map((file, index) => (
											<li
												key={index}
												className="flex justify-between items-center bg-[#292929] px-3 py-1 rounded-md"
											>
												<span className="truncate max-w-[80%]">
													{file.name}
												</span>
												<button
													className="text-red-400 hover:text-red-600 text-xs"
													onClick={() =>
														setAttachments((prev) =>
															prev.filter((_, i) => i !== index)
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
							onFileSelect={(files) => {
								setAttachments((prev) => [...prev, ...files]);
							}}
							onImagesInsert={handleImagesInsert}
						/>
					</>
				)}
			</div>
		</>
	);
}
