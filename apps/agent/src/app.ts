import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import { GoogleMailManager } from "@nova/mail";
import { URL } from "url";
import { createSupervisorWithCredentials } from "./agent";
import { HumanMessage } from "langchain";

const server = http.createServer();
export const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", async (req, socket, head) => {
	const urlObj = new URL(req.url || "", `http://${req.headers.host}`);
	const name = urlObj.searchParams.get("name");
	const email = urlObj.searchParams.get("email");
	const accessToken = urlObj.searchParams.get("accessToken");
	const refreshToken = urlObj.searchParams.get("refreshToken");

	if (!email || !accessToken || !refreshToken) {
		console.warn("Missing required authentication parameters");
		socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
		socket.destroy();
		return;
	}

	wss.handleUpgrade(req, socket, head, (ws) => {
		(ws as any).userinfo = {
			name: name || email,
			email: email,
		};
		(ws as any).credentials = {
			accessToken,
			refreshToken,
		};
		wss.emit("connection", ws, req);
	});
});

wss.on("connection", async (ws: WebSocket, req) => {
	const userinfo = (ws as any).userinfo;
	const credentials = (ws as any).credentials;

	console.log("User connected:", userinfo.email);

	const mailManager = new GoogleMailManager({
		auth: {
			accessToken: credentials.accessToken,
			refreshToken: credentials.refreshToken,
		},
	});

	const supervisor = createSupervisorWithCredentials({ mailManager, userinfo });

	ws.send(
		JSON.stringify({
			role: "agent",
			type: "connected",
			message: `Connected as ${userinfo.email}`,
			timestamp: new Date(),
		})
	);

	ws.on("message", async (message: Buffer) => {
		console.log(`📩 From ${userinfo.name}:`, message.toString());

		try {
			const userMessage = message.toString();

			const result = await supervisor.invoke({
				messages: [new HumanMessage({ content: userMessage })],
			});

			console.log(result);

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

	ws.on("close", () => console.log("Client disconnected:", userinfo.name));
	ws.on("error", (error) => console.error("WebSocket error:", error));
});

export default server;
