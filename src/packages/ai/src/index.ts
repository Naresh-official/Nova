import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { subjectGenerationPrompt } from "./prompts/subject.prompt";
import { enhanceEmailPrompt } from "./prompts/body.prompt";
import { emailSummaryPrompt } from "./prompts/summary.prompt";

export async function generateEmailSubject(emailBody: string) {
	const { textStream } = streamText({
		model: google("gemini-2.5-flash"),
		system: subjectGenerationPrompt,
		prompt: `Email Body: ${emailBody}`,
	});

	return textStream;
}

export async function enhanceEmailContent(params: {
	emailBody: string;
	senderName?: string;
	senderEmail?: string;
	recipientEmail?: string;
	subject?: string;
}) {
	const { textStream } = streamText({
		model: google("gemini-2.5-flash"),
		system: enhanceEmailPrompt,
		prompt: JSON.stringify(params),
	});

	return textStream;
}

export async function summarizeEmail(params: {
	sender?: string;
	recipientEmail?: string;
	subject?: string;
	dateTime?: string;
	emailBody: string;
}) {
	const { textStream } = streamText({
		model: google("gemini-2.5-flash"),
		system: emailSummaryPrompt,
		prompt: JSON.stringify(params),
	});

	return textStream;
}
