import { tool } from "langchain";
import z from "zod";

export const createEmailTool = (credentials: {
	accessToken: string;
	refreshToken: string;
}) => {
	return tool(
		async ({ to, subject, body }) => {
			const { accessToken, refreshToken } = credentials;

			console.log("Sending email with credentials", {
				accessToken,
				refreshToken,
			});

			return `Email sent to ${to} with subject: ${subject}`;
		},
		{
			name: "send_email",
			description: "Sends an email to a recipient",
			schema: z.object({
				to: z.string().describe("Email recipient"),
				subject: z.string().describe("Email subject"),
				body: z.string().describe("Email body content"),
			}),
		}
	);
};

export const createDocumentTool = (credentials: {
	accessToken: string;
	refreshToken: string;
}) => {
	return tool(
		async ({ documentId }) => {
			const { accessToken, refreshToken } = credentials;

			console.log("Fetching document with credentials");

			return `Document ${documentId} retrieved`;
		},
		{
			name: "get_document",
			description: "Retrieves a document from user's storage",
			schema: z.object({
				documentId: z.string().describe("ID of the document to retrieve"),
			}),
		}
	);
};
