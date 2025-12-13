import server, { wss } from "./app";

const PORT = 8001;

try {
	server.listen(PORT, () => {
		console.log(`🚀 WebSocket server running on ws://localhost:${PORT}`);
	});
} catch (error: unknown) {
	console.error("Error starting Websocket server");
	process.exit(1);
}

const shutdown = () => {
	console.log("\nShutting down...");

	server.close(() => {
		console.log("HTTP server closed");
	});

	for (const client of wss.clients) {
		client.close(1001, "Server shutdown");
	}

	wss.close(() => {
		console.log("WebSocket server closed");
		process.exit(0);
	});
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
