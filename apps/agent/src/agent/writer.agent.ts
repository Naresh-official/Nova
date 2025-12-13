import { writer_prompt } from "@agent/prompts/writer.prompt";
import {
	createDraftEmailTool,
	createSendMailTool,
	replyToEmailTool,
} from "@agent/tools/writer.tools";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createAgent, HumanMessage, tool } from "langchain";
import z from "zod";
import type { AgentOptions } from ".";
import { fetchEmailThreadTool } from "@agent/tools/thread.tool";

const model = new ChatGoogleGenerativeAI({
	temperature: 0.7,
	model: "gemini-2.5-flash",
	apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const createWriterAgentWithTools = ({
	mailManager,
	userinfo,
}: AgentOptions) => {
	const sendMail = createSendMailTool({ mailManager, userinfo });
	const createDraft = createDraftEmailTool({ mailManager, userinfo });
	const replyToEmail = replyToEmailTool({
		mailManager,
		userinfo,
	});
	const fetchEmailThread = fetchEmailThreadTool({ mailManager });

	const agent = createAgent({
		model,
		tools: [sendMail, createDraft, replyToEmail, fetchEmailThread],
		systemPrompt: writer_prompt,
	});

	return agent;
};

const createWriterAgentTool = ({ mailManager, userinfo }: AgentOptions) => {
	return tool(
		async ({ query }) => {
			const writerAgent = createWriterAgentWithTools({ mailManager, userinfo });

			const result = await writerAgent.invoke({
				messages: [new HumanMessage({ content: query })],
			});

			return result.messages.at(-1)?.text;
		},
		{
			name: "writer_agent",
			description:
				"Specialized agent for drafting and sending professional emails. Capable of composing new emails from scratch and replying to existing email threads by analyzing thread context. Maintains appropriate tone consistency, validates recipients and content, and ensures professional formatting. Handles both simple compositions and context-aware thread replies with proper subject line and recipient management.",
			schema: z.object({
				query: z
					.string()
					.describe(
						"The enhanced and precise writing task or prompt provided by the user."
					),
			}),
		}
	);
};

export { createWriterAgentTool };
