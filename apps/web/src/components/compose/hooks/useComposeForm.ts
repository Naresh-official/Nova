import { useState, useEffect, useMemo } from "react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import Image from "@tiptap/extension-image";
import { ParseGmailApi } from "gmail-api-parse-message-ts";

interface Draft {
	message?: any;
}

export function useComposeForm(draft?: Draft) {
	const [to, setTo] = useState<string[]>([]);
	const [cc, setCc] = useState<string[]>([]);
	const [bcc, setBcc] = useState<string[]>([]);
	const [subject, setSubject] = useState("");
	const [body, setBody] = useState("");
	const [attachments, setAttachments] = useState<File[]>([]);

	const parsed = useMemo(() => {
		if (!draft?.message) return null;
		const parser = new ParseGmailApi();
		return parser.parseMessage(draft.message);
	}, [draft?.message]);

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				heading: false, // Disable default heading
				blockquote: {
					HTMLAttributes: { class: "border-l-2 pl-4 italic text-gray-600" },
				},
				paragraph: {
					HTMLAttributes: { class: "my-2" },
				},
				bulletList: {
					itemTypeName: "listItem",
					HTMLAttributes: { class: "list-disc ml-6 my-2" },
				},
				orderedList: {
					itemTypeName: "listItem",
					HTMLAttributes: { class: "list-decimal ml-6 my-2" },
				},
			}),
			Heading.extend({
				levels: [1, 2, 3],
				renderHTML({
					node,
					HTMLAttributes,
				}: {
					node: any;
					HTMLAttributes: Record<string, any>;
				}) {
					const level = node.attrs.level as 1 | 2 | 3;
					const levelClasses: Record<1 | 2 | 3, string> = {
						1: "text-3xl font-bold mb-4 mt-6",
						2: "text-2xl font-semibold mb-3 mt-5",
						3: "text-xl font-medium mb-2 mt-4",
					};

					return [
						`h${level}`,
						{
							...HTMLAttributes,
							class: levelClasses[level] || "",
						},
						0,
					];
				},
			}),
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
			setBody(html);
		},
	});

	// Update editor content when body changes
	useEffect(() => {
		if (editor && body !== editor.getHTML()) {
			editor.commands.setContent(body);
		}
	}, [body, editor]);

	// Load draft data
	useEffect(() => {
		if (!parsed) return;

		setTo(parsed.to?.map((r: any) => r.email) || []);
		setCc(parsed.cc?.map((r: any) => r.email) || []);
		setBcc(parsed.bcc?.map((r: any) => r.email) || []);
		setSubject(parsed.subject || "");
		setBody(parsed.textHtml || "");
	}, [parsed]);

	const resetForm = () => {
		setTo([]);
		setCc([]);
		setBcc([]);
		setSubject("");
		setBody("");
		setAttachments([]);
		editor?.commands.clearContent();
	};

	const handleImagesInsert = (base64Images: string[]) => {
		if (editor) {
			const imageHtml = base64Images
				.map(
					(src) =>
						`<p><img src="${src}" class="max-w-full h-auto rounded-md my-2" /></p>`
				)
				.join("");
			editor.chain().focus().insertContent(imageHtml).run();
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

	const isEmpty = () => {
		return (
			!to.length &&
			!cc.length &&
			!bcc.length &&
			!subject &&
			!editor?.getText() &&
			!attachments.length
		);
	};

	return {
		// State
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
		// Methods
		resetForm,
		handleImagesInsert,
		isEmpty,
	};
}
