import { prisma } from "./context";
import httpServer from "./app";

const PORT = process.env.PORT || 5001;

try {
	prisma
		.$connect()
		.then(() => console.log("Connected to DB"))
		.catch((e: unknown) => {
			console.error("DB Connection failed", e);
		});

	httpServer.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`);
		console.log(`WebSocket available at ws://localhost:${PORT}/api/v1/agent`);
	});
} catch (error: unknown) {
	console.error("Error starting server:", error);
	process.exit(1);
}
