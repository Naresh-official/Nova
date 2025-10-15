import { createMimeMessage } from "mimetext";
import { sanitizeTipTapHtml } from "./sanitizeTipTapHtml";
import base64url from "base64url";

export async function createRawMessage(
	senderName: string,
	to: string[],
	subject: string,
	body: string,
	cc: string[] = [],
	bcc: string[] = [],
	attachments: { filename: string; mimeType: string; data: string }[] = [],
	senderEmail: string
) {
	const msg = createMimeMessage();

	msg.setSender({
		addr: senderEmail || "nobody@gmail.com",
		name: senderName,
		type: "From",
	});
	if (to.length > 0) msg.setRecipients(to);
	if (cc.length > 0) msg.setCc(cc);
	if (bcc.length > 0) msg.setBcc(bcc);

	msg.setSubject(subject);

	const { html: processedMessage, inlineImages } = await sanitizeTipTapHtml(
		body.trim()
	);

	msg.addMessage({
		contentType: "text/html",
		data: processedMessage,
	});

	if (inlineImages.length > 0) {
		for (const image of inlineImages) {
			msg.addAttachment({
				inline: true,
				filename: `${image.cid}`,
				contentType: image.mimeType,
				data: image.data,
				headers: {
					"Content-ID": `<${image.cid}>`,
					"Content-Disposition": "inline",
				},
			});
		}
	}

	if (attachments?.length > 0) {
		for (const file of attachments) {
			let base64Content: string | undefined;

			if (typeof (file as any)?.base64 === "string") {
				base64Content = (file as any).base64;
			} else if (typeof (file as any)?.arrayBuffer === "function") {
				const buffer = Buffer.from(await (file as any).arrayBuffer());
				base64Content = buffer.toString("base64");
			}

			if (!base64Content) continue;

			msg.addAttachment({
				filename: file.filename,
				contentType: file.mimeType || "application/octet-stream",
				data: base64Content,
			});
		}
	}

	const emailContent = msg.asRaw();

	const encodedMessage = base64url.encode(emailContent);
	return encodedMessage;
}
