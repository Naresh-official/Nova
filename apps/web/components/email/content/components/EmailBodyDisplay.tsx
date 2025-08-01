"use client";

import React, { useEffect, useRef, useState } from "react";
import { extractBodyContent } from "../utils/extractBodyContent";

interface EmailBodyDisplayProps {
	processedHtml: string | null;
}

const EmailBodyDisplay: React.FC<EmailBodyDisplayProps> = ({
	processedHtml,
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

			// Build style manually
			const style = `
      ::selection {
        background: #7f22fe !important;
        color: white !important;
      }

      *::selection {
        background: #7f22fe !important;
        color: white !important;
      }
    `;

			// Extract body content to avoid full HTML nesting
			const htmlContent = extractBodyContent(processedHtml);

			// Clear previous content
			shadowRoot.innerHTML = `
      <style>${style}</style>
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
			<div
				ref={hostRef}
				style={{
					display: "block",
					overflow: "hidden",
					borderRadius: "0.5rem",
					margin: "2rem",
					minHeight: "200px",
				}}
			/>

			{!injected && processedHtml && (
				<div
					className="mt-4 p-4 bg-black rounded-lg"
					dangerouslySetInnerHTML={{ __html: processedHtml }}
				/>
			)}
		</div>
	);
};

export default EmailBodyDisplay;
