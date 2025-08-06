"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { useEffect, useImperativeHandle, forwardRef } from "react";

interface Props {
	body: string;
	setBodyAction: (body: string) => void;
}

export interface ComposeBodyFieldRef {
	insertImage: (src: string) => void;
	insertMultipleImages: (images: string[]) => void;
}

export const ComposeBodyField = forwardRef<ComposeBodyFieldRef, Props>(
	({ body, setBodyAction }, ref) => {
		const editor = useEditor({
			extensions: [
				StarterKit,
				Image.configure({
					inline: false,
					allowBase64: true,
					HTMLAttributes: {
						class: "max-w-full h-auto rounded-md my-2",
					},
				}),
			],
			content: body || "<p></p>",
			editable: true,
			immediatelyRender: false,
			onUpdate: ({ editor }) => {
				const html = editor.getHTML();
				setBodyAction(html);
			},
		});

		useEffect(() => {
			if (editor && body !== editor.getHTML()) {
				editor.commands.setContent(body);
			}
		}, [body, editor]);

		// Expose editor methods to parent component
		useImperativeHandle(
			ref,
			() => ({
				insertImage: (src: string) => {
					if (editor) {
						editor.chain().focus().setImage({ src }).run();
					}
				},
				insertMultipleImages: (images: string[]) => {
					if (editor) {
						images.forEach((src, index) => {
							if (index === 0) {
								// Focus on the first image
								editor.chain().focus().setImage({ src }).run();
							} else {
								// Add subsequent images
								editor.chain().setImage({ src }).run();
							}
						});
					}
				},
			}),
			[editor]
		);

		if (!editor) {
			return <div className="p-3 text-white/50">Loading editor...</div>;
		}

		return (
			<div className="flex-1 flex flex-col">
				<EditorContent
					editor={editor}
					className="w-full scroll-container flex-1 bg-transparent text-sm text-white p-3 prose prose-invert max-w-none
					[&_.ProseMirror]:focus:outline-none 
					[&_.ProseMirror]:focus-visible:ring-0 
					[&_.ProseMirror]:focus:border-none 
					[&_.ProseMirror]:h-[200px]
					[&_.ProseMirror_p.is-editor-empty:first-child::before]:content-['Type_your_message_here...'] 
					[&_.ProseMirror_p.is-editor-empty:first-child::before]:text-[#999] 
					[&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left 
					[&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none 
					[&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0
					[&_.ProseMirror_img]:max-w-full
					[&_.ProseMirror_img]:rounded-md
					[&_.ProseMirror_img]:my-2"
				/>
			</div>
		);
	}
);

ComposeBodyField.displayName = "ComposeBodyField";
