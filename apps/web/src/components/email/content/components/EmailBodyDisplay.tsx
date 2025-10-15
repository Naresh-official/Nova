"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { extractBodyContent } from "../utils/extractBodyContent";
import {
	detectLightBackgrounds,
	getEnhancedShadowStyles,
} from "../utils/processEmailContent";

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

			// Clear previous content and set up enhanced styling
			shadowRoot.innerHTML = `
				${getEnhancedShadowStyles()}
				<div class="email-wrapper">${htmlContent}</div>
				<script>
					${detectLightBackgrounds()}
				</script>
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
					style={{
						// Fallback inline styles for when shadow DOM fails
						color: "white",
					}}
					dangerouslySetInnerHTML={{
						__html: `
							<style>
								/* Inline fallback styles */
								* { color: white !important; }
								a { color: #60A5FA !important; }
								[style*="background-color: white"],
								[style*="background-color:#fff"],
								[style*="background-color: #fff"],
								[style*="background-color:#ffffff"],
								[style*="background-color: #ffffff"],
								[style*="background-color:#FFFFFF"],
								[style*="background-color: #FFFFFF"],
								[style*="background: white"],
								[style*="background:#fff"],
								[style*="background: #fff"],
								[style*="background:#ffffff"],
								[style*="background: #ffffff"],
								[style*="background:#FFFFFF"],
								[style*="background: #FFFFFF"],
								[bgcolor="white"],
								[bgcolor="#fff"],
								[bgcolor="#ffffff"],
								[bgcolor="#FFFFFF"] {
									color: black !important;
								}
								[style*="background-color: white"] *,
								[style*="background-color:#fff"] *,
								[style*="background-color: #fff"] *,
								[style*="background-color:#ffffff"] *,
								[style*="background-color: #ffffff"] *,
								[style*="background-color:#FFFFFF"] *,
								[style*="background-color: #FFFFFF"] *,
								[style*="background: white"] *,
								[style*="background:#fff"] *,
								[style*="background: #fff"] *,
								[style*="background:#ffffff"] *,
								[style*="background: #ffffff"] *,
								[style*="background:#FFFFFF"] *,
								[style*="background: #FFFFFF"] *,
								[bgcolor="white"] *,
								[bgcolor="#fff"] *,
								[bgcolor="#ffffff"] *,
								[bgcolor="#FFFFFF"] * {
									color: black !important;
								}
							</style>
							${processedHtml}
						`,
					}}
				/>
			)}

			{imageAttachments && imageAttachments.length > 0 && (
				<div className="grid grid-cols-2 gap-2 p-4">
					{imageAttachments.map((attachment) => (
						<div key={attachment.filename} className="relative aspect-square">
							<Image
								src={attachment.data}
								alt={attachment.filename}
								fill
								className="rounded-lg object-cover"
								sizes="(max-width: 768px) 50vw, 25vw"
							/>
						</div>
					))}
				</div>
			)}

			{!processedHtml && plainText && (
				<div className="mt-4 p-4 rounded-lg">
					<pre className="whitespace-pre-wrap break-words text-white">
						{plainText}
					</pre>
				</div>
			)}
		</div>
	);
};

export default EmailBodyDisplay;
