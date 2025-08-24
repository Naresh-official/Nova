import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { subjectGenerationPrompt } from "./prompts/subject.prompt";

export async function generateEmailSubject(emailBody: string) {
	const { text } = await generateText({
		model: google("gemini-2.5-flash"),
		system: subjectGenerationPrompt,
		prompt: `Email Body: ${emailBody}`,
	});

	return text;
}
