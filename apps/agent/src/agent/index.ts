import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createAgent } from "langchain";
import { createWriterAgentTool } from "./writer.agent";
import { supervisor_prompt } from "@agent/prompts/supervisor.prompt";
import type { GoogleMailManager } from "@nova/mail";
import { createSummarizerAgentTool } from "./summarizer.agent";

const model = new ChatGoogleGenerativeAI({
	model: "gemini-2.5-flash",
	temperature: 0.7,
	apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export interface AgentOptions {
	mailManager: GoogleMailManager;
	userinfo: { email: string; name: string };
}

const createSupervisorWithCredentials = ({
	mailManager,
	userinfo,
}: AgentOptions) => {
	const writerAgentTool = createWriterAgentTool({ mailManager, userinfo });
	const summarizerAgentTool = createSummarizerAgentTool({
		mailManager,
		userinfo,
	});

	return createAgent({
		model,
		tools: [writerAgentTool, summarizerAgentTool],
		systemPrompt: supervisor_prompt,
	});
};

export { createSupervisorWithCredentials };
