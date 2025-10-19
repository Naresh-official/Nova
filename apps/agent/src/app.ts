import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import { decode } from "next-auth/jwt";
import { parseCookies } from "./lib/parseCookies";
import { prisma } from "@server/context";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "default_secret_key";

const server = http.createServer();

const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", async (req, socket, head) => {
	const cookies = parseCookies(req.headers.cookie);
	const token = cookies["next-auth.session-token"];

	if (!token) {
		console.warn("❌ No session token found in cookies");
		socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
		socket.destroy();
		return;
	}

	const decoded = await decode({
		token: token,
		secret: JWT_SECRET,
	});

	if (!decoded) {
		console.warn("❌ Invalid or expired JWT");
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

	ws.send(
		JSON.stringify({
			type: "connected",
			message: `Connected as ${user?.email || "unknown user"}`,
			timestamp: new Date().toISOString(),
		})
	);

	ws.on("message", (message: Buffer) => {
		console.log(`📩 From ${user?.id || "unknown"}:`, message.toString());
	});

	ws.on("close", () => console.log("Client disconnected:", user?.id));
	ws.on("error", (error) => console.error("WebSocket error:", error));
});

export default server;
