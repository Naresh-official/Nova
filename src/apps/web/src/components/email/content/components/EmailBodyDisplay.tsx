"use client";

import React, { useEffect, useRef, useState } from "react";
import { extractBodyContent } from "../utils/extractBodyContent";

interface EmailBodyDisplayProps {
	processedHtml: string | null;
	plainText: string | null;
	imageAttachments?: {
		filename: string;
		mimeType: string;
		data: string;
		size: number;
		src: string;
	}[];
}

const EmailBodyDisplay: React.FC<EmailBodyDisplayProps> = ({
	processedHtml,
	plainText,
	imageAttachments,
}) => {
	const hostRef = useRef<HTMLDivElement>(null);
	const shadowRootRef = useRef<ShadowRoot | null>(null);
	const [injected, setInjected] = useState(false);

	useEffect(() => {
		if (!hostRef.current || !processedHtml) return;

		try {
			const shadowRoot =
				hostRef.current.shadowRoot ||
				hostRef.current.attachShadow({ mode: "open" });

			shadowRootRef.current = shadowRoot;

			// Extract body content to avoid full HTML nesting
			const htmlContent = extractBodyContent(processedHtml);

			// Clear previous content
			shadowRoot.innerHTML = `
      <div class="email-wrapper">${htmlContent}</div>
    `;

			setInjected(true);
		} catch (error) {
			console.error("Error with shadow DOM:", error);
			setInjected(false);
		}
	}, [processedHtml]);

	return (
		<div className="rounded-lg p-4 selectable-email-container">
			{processedHtml && (
				<div
					ref={hostRef}
					style={{
						display: "block",
						overflow: "hidden",
						borderRadius: "0.5rem",
						margin: "2rem",
						minHeight: "100px",
					}}
				/>
			)}

			{!injected && processedHtml && (
				<div
					className="mt-4 bg-black px-4 rounded-lg"
					dangerouslySetInnerHTML={{ __html: processedHtml }}
				/>
			)}
			{imageAttachments && imageAttachments.length > 0 && (
				<div className="grid grid-cols-2 gap-2 p-4">
					{imageAttachments.map((attachment) => (
						<img
							key={attachment.filename}
							src={attachment.data}
							alt={attachment.filename}
							className="rounded-lg"
						/>
					))}
				</div>
			)}
			{!processedHtml && plainText && (
				<div className="mt-4 p-4 rounded-lg">
					<pre className="whitespace-pre-wrap break-words">{plainText}</pre>
				</div>
			)}
		</div>
	);
};

export default EmailBodyDisplay;
