import express from "express";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers";

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

app.use("/trpc", createExpressMiddleware({ router: appRouter }));

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.listen(8000, () => {
	console.log("Server is running on http://localhost:8000");
});

export type AppRouter = typeof appRouter;
