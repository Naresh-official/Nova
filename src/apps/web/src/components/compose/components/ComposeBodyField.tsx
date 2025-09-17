"use client";

import React, { useEffect } from "react";
import { Button } from "@nova/ui/components/button";
import { EditorContent, Editor } from "@tiptap/react";
import { Sparkles } from "lucide-react";
import { useStream } from "@/hooks/useStream";
import { toast } from "sonner";

interface Props {
	editor: Editor | null;
	senderName: string | null | undefined;
	senderEmail: string | null | undefined;
	recipientEmail: string | null | undefined;
	subject: string | null | undefined;
}

export const ComposeBodyField = ({
	editor,
	senderName,
	senderEmail,
	recipientEmail,
	subject,
}: Props) => {
	const isEmpty = () => {
		return !editor?.getText().trim();
	};

	const { data, start, stop, isStreaming, error } =
		useStream("/ai/enhance-email");

	useEffect(() => {
		if (data && editor) {
			editor.commands.setContent(data.trim());
		}
	}, [data, editor]);

	useEffect(() => {
		if (error) {
			toast.error("Failed to enhance email", {
				description:
					error.message || "An error occurred while enhancing the email",
			});
		}
	}, [error]);

	if (!editor) {
		return <div className="p-3 text-white/50">Loading editor...</div>;
	}

	return (
		<div className="flex-1 flex flex-col">
			<EditorContent
				editor={editor}
				className="w-full scroll-container flex-1 bg-transparent text-sm text-white p-3 mb-10 prose prose-invert max-w-none
				[&_.ProseMirror]:focus:outline-none 
				[&_.ProseMirror]:focus-visible:ring-0 
				[&_.ProseMirror]:focus:border-none 
				[&_.ProseMirror]:h-[250px]
				[&_.ProseMirror_p.is-editor-empty:first-child::before]:content-['Type_your_message_here...'] 
				[&_.ProseMirror_p.is-editor-empty:first-child::before]:text-[#999] 
				[&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left 
				[&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none 
				[&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0
				[&_.ProseMirror_img]:max-w-full
				[&_.ProseMirror_img]:rounded-md
				[&_.ProseMirror_img]:my-2"
			/>
			<Button
				variant="secondary"
				className="w-42 border-2 border-primary absolute bottom-18 right-2"
				disabled={isEmpty() || isStreaming}
				onClick={() =>
					start({
						emailBody: editor?.getText() || "",
						senderName,
						senderEmail,
						recipientEmail,
						subject,
					})
				}
			>
				<Sparkles />
				{isStreaming ? "Enhancing..." : "Enhance with AI"}
			</Button>
		</div>
	);
};
