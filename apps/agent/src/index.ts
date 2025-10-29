import { prisma } from "@server/context";
import server from "./app";

const PORT = 8001;

try {
	prisma
		.$connect()
		.then(() => console.log("Connected to DB"))
		.catch((e: unknown) => {
			console.error("DB Connection failed", e);
		});

	server.listen(PORT, () => {
		console.log(`🚀 WebSocket server running on ws://localhost:${PORT}`);
	});
} catch (error: unknown) {
	console.error("Error starting Websocket server");
	process.exit(1);
}

if (process.env.NODE_ENV === "production") {
	process.on("SIGTERM", () => {
		console.log("SIGTERM received, closing server...");
		server.close(() => {
			console.log("Server closed");
			process.exit(0);
		});
	});

	process.on("SIGINT", () => {
		console.log("\nSIGINT received, closing server...");
		server.close(() => {
			console.log("Server closed");
			process.exit(0);
		});
	});
}
