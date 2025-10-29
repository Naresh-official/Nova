// writer.agent.ts
import { writer_prompt } from "@agent/prompts/writer.prompt";
import { createDocumentTool, createEmailTool } from "@agent/tools/test";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createAgent, HumanMessage, tool } from "langchain";
import z from "zod";

const model = new ChatGoogleGenerativeAI({
	temperature: 0.7,
	model: "gemini-2.5-flash",
	apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});



const createWriterAgentWithTools = (credentials: {
	accessToken: string;
	refreshToken: string;
}) => {
	const emailTool = createEmailTool(credentials);
	const documentTool = createDocumentTool(credentials);

	const agent = createAgent({
		model,
		tools: [emailTool, documentTool],
		systemPrompt: writer_prompt,
	});

	return agent;
};

const createWriterAgentTool = (credentials: {
	accessToken: string;
	refreshToken: string;
}) => {
	return tool(
		async ({ query }) => {
			const writerAgent = createWriterAgentWithTools(credentials);

			const result = await writerAgent.invoke({
				messages: [new HumanMessage({ content: query })],
			});

			return result.messages.at(-1)?.text;
		},
		{
			name: "writer_agent",
			description:
				"Agent specialized in drafting and composing text content such as emails, replies, and documents.",
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
