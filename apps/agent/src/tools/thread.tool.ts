import type { AgentOptions } from "@agent/agent";
import { tool } from "@langchain/core/tools";
import z from "zod";

export const fetchEmailThreadTool = ({
	mailManager,
}: Pick<AgentOptions, "mailManager">) => {
	return tool(
		async ({ threadId }) => {
			return await mailManager.threads.getThread(threadId);
		},
		{
			name: "fetch_email_thread",
			description:
				"Fetches the complete email thread including all messages, participants, timestamps, and content.",
			schema: z.object({
				threadId: z.string().describe("The ID of the email thread to fetch"),
			}),
		}
	);
};
