import type { AgentOptions } from "@agent/agent";
import { tool } from "langchain";
import z from "zod";

export const createSendMailTool = ({ mailManager, userinfo }: AgentOptions) => {
	return tool(
		async ({ to, subject, body, cc, bcc }) => {
			await mailManager.emailComposer.sendEmail({
				senderName: userinfo.name,
				to,
				subject,
				body,
				cc: cc || [],
				bcc: bcc || [],
			});
		},
		{
			name: "send_email",
			description: "Sends an email to a recipient",
			schema: z.object({
				to: z.array(z.string().describe("Email recipient")),
				subject: z.string().describe("Email subject"),
				body: z.string().describe("Email body content"),
				cc: z.array(z.email()).optional().describe("CC email recipients"),
				bcc: z.array(z.email()).optional().describe("BCC email recipients"),
			}),
		}
	);
};

export const createDraftEmailTool = ({
	mailManager,
	userinfo,
}: AgentOptions) => {
	return tool(
		async ({ to, subject, body, cc, bcc }) => {
			await mailManager.drafts.createDraft(
				userinfo.name,
				to,
				subject,
				body,
				cc || [],
				bcc || []
			);
		},
		{
			name: "create_draft_email",
			description: "Creates a draft email",
			schema: z.object({
				to: z.array(z.string().describe("Email recipient")),
				subject: z.string().describe("Email subject"),
				body: z.string().describe("Email body content"),
				cc: z.array(z.email()).optional().describe("CC email recipients"),
				bcc: z.array(z.email()).optional().describe("BCC email recipients"),
			}),
		}
	);
};

export const replyToEmailTool = ({ mailManager, userinfo }: AgentOptions) => {
	return tool(
		async ({ threadId, body }) => {
			await mailManager.emailComposer.replyToEmail({
				senderName: userinfo.name,
				body,
				threadId,
			});
		},
		{
			name: "reply_to_email",
			description: "Replies to an email",
			schema: z.object({
				threadId: z.string().describe("The ID of the email thread to reply to"),
				body: z.string().describe("The content of the reply email"),
			}),
		}
	);
};
