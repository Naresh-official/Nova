import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers";
import { createContext } from "./context";
import cookieParser from "cookie-parser";
import { decode } from "next-auth/jwt";
import { prisma } from "./context";

dotenv.config();

const app = express();

app.use(
	cors({
		origin: process.env.FRONTEND_URL || "*",
		credentials: true,
		methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
	})
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
	"/trpc",
	createExpressMiddleware({
		router: appRouter,
		createContext,
		onError: ({ error, req, type, path, input }) => {
			// Log errors
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

try {
	prisma
		.$connect()
		.then(() => console.log("Connected to DB"))
		.catch((e) => console.error("DB Connection failed", e));
	app.listen(8000, () => {
		console.log("Server is running on http://localhost:8000");
	});
} catch (error) {
	console.error("Error starting server:", error);
	process.exit(1);
}
