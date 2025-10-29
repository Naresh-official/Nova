// supervisor.agent.ts
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createAgent } from "langchain";
import { createWriterAgentTool } from "./writer.agent";
import { supervisor_prompt } from "@agent/prompts/supervisor.prompt";

const model = new ChatGoogleGenerativeAI({
	model: "gemini-2.5-flash",
	temperature: 0.7,
	apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const createSupervisorWithCredentials = (credentials: {
	accessToken: string;
	refreshToken: string;
}) => {
	const writerAgentTool = createWriterAgentTool(credentials);

	return createAgent({
		model,
		tools: [writerAgentTool],
		systemPrompt: supervisor_prompt,
	});
};

export { createSupervisorWithCredentials };
