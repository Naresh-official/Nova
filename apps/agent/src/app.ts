// websocket.ts
import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import { decode } from "next-auth/jwt";
import { parseCookies } from "./lib/parseCookies";
import { prisma } from "@server/context";
import { createSupervisorWithCredentials } from "./agent";
import { HumanMessage } from "langchain";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "default_secret_key";

const server = http.createServer();
const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", async (req, socket, head) => {
	const cookies = parseCookies(req.headers.cookie);
	const token = cookies["next-auth.session-token"];

	if (!token) {
		console.warn("No session token found in cookies");
		socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
		socket.destroy();
		return;
	}

	const decoded = await decode({
		token: token,
		secret: JWT_SECRET,
	});

	if (!decoded) {
		console.warn("Invalid or expired JWT");
		socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
		socket.destroy();
		return;
	}

	wss.handleUpgrade(req, socket, head, (ws) => {
		(ws as any).user = decoded;
		wss.emit("connection", ws, req);
	});
});

wss.on("connection", async (ws: WebSocket, req) => {
	const user = (ws as any).user;
	const credentials = await prisma.user.findUnique({
		where: { email: user.email },
		select: {
			accessToken: true,
			refreshToken: true,
		},
	});

	if (!credentials || !credentials.accessToken || !credentials.refreshToken) {
		ws.send(
			JSON.stringify({
				role: "agent",
				type: "error",
				message: "Failed to retrieve credentials",
			})
		);
		ws.close();
		return;
	}

	const supervisor = createSupervisorWithCredentials({
		accessToken: credentials.accessToken,
		refreshToken: credentials.refreshToken,
	});

	ws.send(
		JSON.stringify({
			role: "agent",
			type: "connected",
			message: `Connected as ${user?.email || "unknown user"}`,
			timestamp: new Date(),
		})
	);

	ws.on("message", async (message: Buffer) => {
		console.log(`📩 From ${user?.name || "unknown"}:`, message.toString());

		try {
			const userMessage = message.toString();

			const result = await supervisor.invoke({
				messages: [new HumanMessage({ content: userMessage })],
			});

			ws.send(
				JSON.stringify({
					role: "agent",
					type: "message",
					message: result.messages.at(-1)?.content,
					timestamp: new Date(),
				})
			);
		} catch (error) {
			console.error("Error processing message:", error);
			ws.send(
				JSON.stringify({
					role: "agent",
					type: "error",
					message: "Failed to process message",
				})
			);
		}
	});

	ws.on("close", () => console.log("Client disconnected:", user?.name));
	ws.on("error", (error) => console.error("WebSocket error:", error));
});

export default server;
