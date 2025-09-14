import express, { type Express } from "express";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers/trpcRouter";
import { createContext } from "./context";
import cookieParser from "cookie-parser";
import { decode } from "next-auth/jwt";
import aiRouter from "./routers/expressRouter";

const app: Express = express();

app.use(
	cors({
		origin: process.env.FRONTEND_URL || "*",
		credentials: true,
		methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
	})
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
	"/trpc",
	createExpressMiddleware({
		router: appRouter,
		createContext,
		onError: ({ error, req, type, path, input }) => {
			console.error("tRPC Error:", {
				error: error.message,
				type,
				path,
				input,
				stack: error.stack,
			});
		},
	})
);

app.use("/api/v1/ai", aiRouter);

app.get("/health", (req, res) => {
	res.send("Health Check: Server is running");
});

app.get("/verify", async (req, res) => {
	const token = req.cookies["next-auth.session-token"];
	const decoded = await decode({
		token: token,
		secret: process.env.NEXTAUTH_SECRET as string,
	});
	res.status(200).json({
		message: "Token received",
		token: token || "No token found",
		decoded: decoded || "No token decoded",
	});
});

// TODO: Remove this SSE endpoint
app.get("/sse", (req, res) => {
	res.setHeader("Content-Type", "text/event-stream");
	res.setHeader("Cache-Control", "no-cache");
	res.setHeader("Connection", "keep-alive");
	res.flushHeaders();

	const longText =
		"This is a long text message being sent chunk by chunk over SSE. " +
		"It allows the frontend to display the response progressively, " +
		"just like live typing or streaming responses from AI models. " +
		"SSE is great for one-way communication from server to client.";

	const chunks = longText.split(" ");

	let index = 0;
	const interval = setInterval(() => {
		if (index < chunks.length) {
			res.write(`data: ${chunks[index]}\n\n`);
			index++;
		} else {
			clearInterval(interval);
			res.write("event: done\ndata: Stream complete\n\n");
			res.end();
		}
	}, 300); // send a word every 300ms
});

export default app;
