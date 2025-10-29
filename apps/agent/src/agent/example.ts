import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import {
	AIMessage,
	HumanMessage,
	SystemMessage,
	ToolMessage,
	type BaseMessage,
} from "@langchain/core/messages";
import { registry } from "@langchain/langgraph/zod";
import {
	END,
	MessagesAnnotation,
	MessagesZodMeta,
	START,
	StateGraph,
} from "@langchain/langgraph";
import { createAgent } from "langchain";

const model = new ChatGoogleGenerativeAI({
	model: "gemini-2.5-flash",
	temperature: 0.7,
	apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const add = tool(
	async (args) => {
		console.log("calling add tool");
		return args.a + args.b;
	},
	{
		name: "add",
		description: "Add two numbers.",
		schema: z.object({
			a: z.number(),
			b: z.number(),
		}),
	}
);

const multiply = tool(
	async (args) => {
		console.log("calling multiply tool");
		return args.a * args.b;
	},
	{
		name: "multiply",
		description: "Multiply two numbers.",
		schema: z.object({
			a: z.number(),
			b: z.number(),
		}),
	}
);

const webSearch = tool(
	async (args) => {
		console.log("calling web search tool with query:", args.query);
		return (
			"Here are the headcounts for each of the FAANG companies in 2024:\n" +
			"1. **Facebook (Meta)**: 67,317 employees.\n" +
			"2. **Apple**: 164,000 employees.\n" +
			"3. **Amazon**: 1,551,000 employees.\n" +
			"4. **Netflix**: 14,000 employees.\n" +
			"5. **Google (Alphabet)**: 181,269 employees."
		);
	},
	{
		name: "web_search",
		description: "Search the web for information.",
		schema: z.object({
			query: z.string(),
		}),
	}
);

const mathAgentToolsByName = {
	[add.name]: add,
	[multiply.name]: multiply,
};

const mathAgentTools = Object.values(mathAgentToolsByName);

const mathAgentModelWithTools = model.bindTools(mathAgentTools);

const MessagesState = z.object({
	messages: z
		.array(z.custom<BaseMessage>())
		.register(registry, MessagesZodMeta as any),
	llmCalls: z.number().optional().default(0),
});

async function llmCall(state: z.infer<typeof MessagesState>) {
	return {
		messages: await mathAgentModelWithTools.invoke([
			new SystemMessage(
				"You are a math expert. Always use one tool at a time."
			),
			...state.messages,
		]),
		llmCalls: (state.llmCalls ?? 0) + 1,
	};
}

async function toolNode(state: z.infer<typeof MessagesState>) {
	const lastMessage = state.messages.at(-1);

	if (lastMessage == null || !AIMessage.isInstance(lastMessage)) {
		return { messages: [] };
	}

	const result: ToolMessage[] = [];
	for (const toolCall of lastMessage.tool_calls ?? []) {
		const tool = mathAgentToolsByName[toolCall.name];
		const observation = await tool.invoke(toolCall);
		result.push(observation);
	}

	return { messages: result };
}

async function shouldContinue(state: typeof MessagesAnnotation.State) {
	const lastMessage = state.messages.at(-1);
	if (lastMessage == null || !AIMessage.isInstance(lastMessage)) return END;

	if (lastMessage.tool_calls?.length) {
		return "toolNode";
	}

	return END;
}

const mathAgent = new StateGraph(MessagesState)
	.addNode("llmCall", llmCall)
	.addNode("toolNode", toolNode)
	.addEdge(START, "llmCall")
	.addConditionalEdges("llmCall", shouldContinue, ["toolNode", END])
	.addEdge("toolNode", "llmCall")
	.compile({ name: "math_expert" });

const researchAgentToolsByName = {
	[webSearch.name]: webSearch,
};

const researchAgentTools = Object.values(researchAgentToolsByName);

const researchAgentModelWithTools = model.bindTools(researchAgentTools);

async function researchAgentLLMCall(state: z.infer<typeof MessagesState>) {
	return {
		messages: await researchAgentModelWithTools.invoke([
			new SystemMessage(
				"You are a world class researcher with access to web search. Do not do any math."
			),
			...state.messages,
		]),
		llmCalls: (state.llmCalls ?? 0) + 1,
	};
}

async function researchAgentToolNode(state: z.infer<typeof MessagesState>) {
	const lastMessage = state.messages.at(-1);
	if (lastMessage == null || !AIMessage.isInstance(lastMessage)) {
		return { messages: [] };
	}

	const result: ToolMessage[] = [];
	for (const toolCall of lastMessage.tool_calls ?? []) {
		const tool = researchAgentToolsByName[toolCall.name];
		const observation = await tool.invoke(toolCall);
		result.push(observation);
	}

	return { messages: result };
}

const researchAgent = new StateGraph(MessagesState)
	.addNode("llmCall", researchAgentLLMCall)
	.addNode("toolNode", researchAgentToolNode)
	.addEdge(START, "llmCall")
	.addConditionalEdges("llmCall", shouldContinue, ["toolNode", END])
	.addEdge("toolNode", "llmCall")
	.compile({ name: "research_expert" });

const callMathAgent = tool(
	async ({ query }) => {
		const result = await mathAgent.invoke({
			messages: [new HumanMessage({ content: query })],
		});
		return result.messages.at(-1)?.text;
	},
	{
		name: "math_agent",
		description: "A math expert agent to answer math related questions.",
		schema: z.object({
			query: z
				.string()
				.describe("The math question to send to the math agent."),
		}),
	}
);

const callResearchAgent = tool(
	async ({ query }) => {
		const result = await researchAgent.invoke({
			messages: [new HumanMessage({ content: query })],
		});
		return result.messages.at(-1)?.text;
	},
	{
		name: "research_agent",
		description:
			"A research expert agent to answer questions about current events.",
		schema: z.object({
			query: z
				.string()
				.describe("The research question to send to the research agent."),
		}),
	}
);

const supervisor = createAgent({
	model,
	tools: [callMathAgent, callResearchAgent],
	systemPrompt:
		"You are a team supervisor managing a research expert and a math expert. " +
		"For current events, use research_agent. " +
		"For math problems, use math_agent.",
});

async function main() {
	const result = await supervisor.invoke({
		messages: [
			new HumanMessage({
				content:
					"Using web search, find the headcounts for each of the FAANG companies in 2024, " +
					"then calculate the total headcount across all five companies.",
			}),
		],
	});
	console.log("Final messages:", result.messages.at(-1)?.content);
}

main();
