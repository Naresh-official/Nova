import express, { type Express } from "express";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers/trpcRouter";
import { createContext } from "./context";
import cookieParser from "cookie-parser";
import { decode } from "next-auth/jwt";
import aiRouter from "./routers/expressRouter";
import { createServer } from "http";
import { setupWebSocketServer } from "./ws";

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

// WebSocket server setup
const httpServer = createServer(app);
setupWebSocketServer(httpServer);

export default httpServer;
