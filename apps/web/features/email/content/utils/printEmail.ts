import { extractBodyContent } from "./extractBodyContent";

interface EmailData {
	subject?: string;
	from?: {
		name?: string;
		email?: string;
	};
	to?: Array<{
		name?: string;
		email?: string;
	}>;
	sentDate?: string;
	textHtml?: string;
}

export const printEmail = (emailData: EmailData, recipientText: string) => {
	const iframe = document.createElement("iframe");
	iframe.style.position = "absolute";
	iframe.style.left = "-10000px";
	iframe.style.top = "-10000px";
	iframe.style.width = "0px";
	iframe.style.height = "0px";
	iframe.style.border = "none";
	document.body.appendChild(iframe);

	const printContent = `
		<!DOCTYPE html>
		<html>
		<head>
			<title>Print Email - ${emailData.subject || "No Subject"}</title>
			<style>
				body {
					font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
					line-height: 1.6;
					color: #333;
					max-width: 800px;
					margin: 0 auto;
					padding: 20px;
				}
				.email-header {
					border-bottom: 2px solid #eee;
					padding-bottom: 20px;
					margin-bottom: 20px;
				}
				.subject {
					font-size: 24px;
					font-weight: bold;
					margin-bottom: 10px;
				}
				.meta-info {
					color: #666;
					font-size: 14px;
					margin-bottom: 5px;
				}
				.email-content {
					margin-top: 20px;
				}
				@media print {
					body { margin: 0; }
				}
			</style>
		</head>
		<body>
			<div class="email-header">
				<div class="subject">${emailData.subject || "No Subject"}</div>
				<div class="meta-info"><strong>From:</strong> ${emailData.from?.name || emailData.from?.email || "Unknown Sender"} &lt;${emailData.from?.email || ""}&gt;</div>
				<div class="meta-info"><strong>To:</strong> ${recipientText} &lt;${emailData.to?.[0]?.email || ""}&gt;</div>
				<div class="meta-info"><strong>Date:</strong> ${new Date(emailData.sentDate || "").toLocaleString()}</div>
			</div>
			<div class="email-content">
				${extractBodyContent(emailData.textHtml || "")}
			</div>
		</body>
		</html>
	`;

	const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
	if (iframeDoc) {
		iframeDoc.open();
		iframeDoc.write(printContent);
		iframeDoc.close();

		iframe.onload = () => {
			iframe.contentWindow?.focus();
			iframe.contentWindow?.print();
			setTimeout(() => {
				document.body.removeChild(iframe);
			}, 1000);
		};
	}
};
