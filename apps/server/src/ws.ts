import { Server as HTTPServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { decode } from "next-auth/jwt";
import { prisma } from "./context";

export function setupWebSocketServer(httpServer: HTTPServer) {
	const wss = new WebSocketServer({ noServer: true });

	wss.on("connection", (ws, request) => {
		const userCredentials = (request as any).userCredentials;

		if (!userCredentials) {
			ws.close(1008, "Unauthorized");
			return;
		}

		const agentWsUrl =
			process.env.AGENT_WEBSOCKET_URL || "ws://localhost:8001/api/v1/agent";
		const urlWithParams = new URL(agentWsUrl);
		urlWithParams.searchParams.set("name", userCredentials.name);
		urlWithParams.searchParams.set("email", userCredentials.email);
		urlWithParams.searchParams.set("accessToken", userCredentials.accessToken);
		urlWithParams.searchParams.set(
			"refreshToken",
			userCredentials.refreshToken
		);

		const agentWs = new WebSocket(urlWithParams.toString());

		agentWs.on("open", () => {});

		agentWs.on("message", (message) => {
			if (ws.readyState === WebSocket.OPEN) {
				ws.send(message);
			}
		});

		agentWs.on("error", (error) => {
			console.error("Agent WebSocket error:", error);
			if (ws.readyState === WebSocket.OPEN) {
				ws.send(
					JSON.stringify({
						type: "error",
						message: "Agent server error",
					})
				);
			}
		});

		agentWs.on("close", () => {
			if (ws.readyState === WebSocket.OPEN) {
				ws.close(1000, "Agent server disconnected");
			}
		});

		ws.on("message", (message) => {
			if (agentWs.readyState === WebSocket.OPEN) {
				agentWs.send(message);
			} else {
				ws.send(
					JSON.stringify({
						type: "error",
						message: "Agent server not connected",
					})
				);
			}
		});

		ws.on("close", () => {
			if (agentWs.readyState === WebSocket.OPEN) {
				agentWs.close();
			}
		});

		ws.on("error", (error) => {
			console.error("Client WebSocket error:", error);
			if (agentWs.readyState === WebSocket.OPEN) {
				agentWs.close();
			}
		});
	});

	httpServer.on("upgrade", async (request, socket, head) => {
		const pathname = new URL(
			request.url || "",
			`http://${request.headers.host}`
		).pathname;

		if (pathname === "/api/v1/agent") {
			try {
				const cookies = request.headers.cookie?.split(";").reduce(
					(acc, cookie) => {
						const [key, value] = cookie.trim().split("=");
						acc[key] = value;
						return acc;
					},
					{} as Record<string, string>
				);

				const token = cookies?.["next-auth.session-token"];

				if (!token) {
					socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
					socket.destroy();
					return;
				}

				const decoded = await decode({
					token: token,
					secret: process.env.NEXTAUTH_SECRET as string,
				});

				if (!decoded || !decoded.email) {
					socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
					socket.destroy();
					return;
				}

				const user = await prisma.user.findUnique({
					where: { email: decoded.email as string },
				});

				if (!user) {
					socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
					socket.destroy();
					return;
				}

				(request as any).userCredentials = {
					name: user.name,
					email: user.email,
					accessToken: user.accessToken,
					refreshToken: user.refreshToken,
				};

				wss.handleUpgrade(request, socket, head, (ws) => {
					wss.emit("connection", ws, request);
				});
			} catch (error) {
				console.error("WebSocket upgrade error:", error);
				socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
				socket.destroy();
			}
		} else {
			socket.destroy();
		}
	});
}
