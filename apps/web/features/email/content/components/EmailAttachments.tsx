import React from "react";
import { Button } from "@nova/ui/components/button";
import { FileText, Download } from "lucide-react";

interface Attachment {
	filename: string;
	mimeType: string;
	data: string;
	size: number;
	src: string;
}

interface EmailAttachmentsProps {
	attachments: Attachment[] | undefined;
}

const getFileSizeInMB = (sizeInBytes: number) => {
	return (sizeInBytes / (1024 * 1024)).toFixed(2);
};

const EmailAttachments: React.FC<EmailAttachmentsProps> = ({ attachments }) => {
	const pdfAttachments = attachments?.filter(
		(attachment) =>
			attachment.mimeType === "application/pdf" ||
			(attachment.mimeType === "application/octet-stream" &&
				attachment.filename.toLowerCase().endsWith(".pdf"))
	);

	if (!pdfAttachments || pdfAttachments.length === 0) {
		return null;
	}

	return (
		<div className="p-4 flex flex-col gap-2">
			{pdfAttachments.map((attachment) => (
				<Button
					asChild
					key={attachment.filename}
					variant="secondary"
					className="max-w-80"
				>
					<a
						href={attachment.src}
						download={attachment.filename}
						className="flex justify-start w-full items-center gap-2"
					>
						<FileText size={20} className="text-red-500" />
						<span className="text-white text-sm max-w-60 truncate">
							{attachment.filename}
						</span>
						<span className="text-gray-400 text-xs">
							({getFileSizeInMB(attachment.size)} MB)
						</span>
						<Download size={20} className="text-gray-400 ml-auto" />{" "}
					</a>
				</Button>
			))}
		</div>
	);
};

export default EmailAttachments;
