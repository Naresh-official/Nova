import { fetchEmailThreadTool } from "@agent/tools/thread.tool";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import type { AgentOptions } from ".";
import { summarizer_prompt } from "@agent/prompts/summarizer.prompt";
import { createAgent, HumanMessage, tool } from "langchain";
import z from "zod";

const model = new ChatGoogleGenerativeAI({
	temperature: 0.7,
	model: "gemini-2.5-flash",
	apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const createSummarizerAgentWithTools = ({
	mailManager,
}: Pick<AgentOptions, "mailManager">) => {
	const fetchEmailThread = fetchEmailThreadTool({ mailManager });

	const agent = createAgent({
		model,
		tools: [fetchEmailThread],
		systemPrompt: summarizer_prompt,
	});

	return agent;
};

const createSummarizerAgentTool = ({ mailManager, userinfo }: AgentOptions) => {
	// TODO : use userinfo in contet for summarization
	return tool(
		async ({ query }) => {
			const summarizerAgent = createSummarizerAgentWithTools({ mailManager });

			const result = await summarizerAgent.invoke({
				messages: [new HumanMessage({ content: query })],
			});

			return result.messages.at(-1)?.text;
		},
		{
			name: "summarizer_agent",
			description:
				"Specialized agent for fetching and summarizing entire email threads. Capable of analyzing thread context, identifying participants, and summarizing conversations from the user's perspective when applicable. Produces clear, concise summaries highlighting main points, tone, outcomes, and next steps while maintaining factual accuracy and appropriate tone.",
			schema: z.object({
				query: z
					.string()
					.describe(
						"The precise summarization task or prompt provided by the user, including the threadId to summarize."
					),
			}),
		}
	);
};

export { createSummarizerAgentTool };
