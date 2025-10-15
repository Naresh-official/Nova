import { WebSocketServer, WebSocket } from "ws";
import http from "http";

const PORT = 8001;

// Create HTTP server (needed for ws to bind)
const server = http.createServer();

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Sample long paragraph for streaming test
const LONG_PARAGRAPH = `
In the heart of a bustling metropolis, where towering skyscrapers pierce the clouds and the streets pulse with endless energy, 
there exists a peculiar phenomenon that few notice but many experience. The city breathes with a rhythm all its own, a symphony 
of honking horns, chattering pedestrians, and the distant rumble of subway trains beneath the pavement. Each morning, as dawn 
breaks over the concrete horizon, millions of souls emerge from their homes, each carrying dreams, worries, and aspirations 
unique to their own stories. The coffee shops fill with the aroma of freshly ground beans, bakeries release the sweet scent 
of warm pastries into the crisp morning air, and the world slowly awakens to another day of infinite possibilities. Yet beneath 
this orchestrated chaos lies an underlying current of connection—strangers sharing brief moments in elevators, neighbors nodding 
in recognition, and the collective understanding that we are all participants in this grand urban theater. As the sun arcs 
across the sky, casting long shadows between buildings, the city transforms, revealing different facets of its personality 
with each passing hour, until night falls and the neon lights paint the streets in vibrant hues of promise and mystery.
`.trim();

// WebSocket connection handler
wss.on("connection", (ws: WebSocket) => {
	console.log("New WebSocket client connected");

	// Send welcome message
	ws.send(
		JSON.stringify({
			type: "connected",
			message: "Connected to Nova Agent WebSocket Server",
			timestamp: new Date().toISOString(),
		})
	);

	// Handle incoming messages
	ws.on("message", async (data: Buffer) => {
		try {
			const message = JSON.parse(data.toString());
			console.log("Received message:", message);

			if (message.type === "stream-test") {
				await handleStreamTest(ws);
			} else if (message.type === "ping") {
				ws.send(
					JSON.stringify({
						type: "pong",
						timestamp: new Date().toISOString(),
					})
				);
			} else {
				ws.send(
					JSON.stringify({
						type: "error",
						message: "Unknown message type",
						receivedType: message.type,
					})
				);
			}
		} catch (error) {
			console.error("Error processing message:", error);
			ws.send(
				JSON.stringify({
					type: "error",
					message: "Invalid message format",
				})
			);
		}
	});

	ws.on("close", () => console.log("Client disconnected"));
	ws.on("error", (error) => console.error("WebSocket error:", error));
});

// Stream test handler - streams paragraph chunk by chunk
async function handleStreamTest(ws: WebSocket) {
	console.log("Starting stream test...");

	const words = LONG_PARAGRAPH.split(" ");
	const chunkSize = 5; // 5 words per chunk
	const delayMs = 100; // 100ms delay between chunks

	ws.send(
		JSON.stringify({
			type: "stream-start",
			totalWords: words.length,
			chunkSize,
			timestamp: new Date().toISOString(),
		})
	);

	for (let i = 0; i < words.length; i += chunkSize) {
		const chunk = words.slice(i, i + chunkSize).join(" ");
		const isLastChunk = i + chunkSize >= words.length;

		ws.send(
			JSON.stringify({
				type: "stream-chunk",
				chunk: chunk + (isLastChunk ? "" : " "),
				chunkNumber: Math.floor(i / chunkSize) + 1,
				totalChunks: Math.ceil(words.length / chunkSize),
				isLastChunk,
				timestamp: new Date().toISOString(),
			})
		);

		if (!isLastChunk) {
			await new Promise((resolve) => setTimeout(resolve, delayMs));
		}
	}

	ws.send(
		JSON.stringify({
			type: "stream-end",
			message: "Stream completed successfully",
			timestamp: new Date().toISOString(),
		})
	);

	console.log("Stream test completed");
}

// Start the server
server.listen(PORT, () => {
	console.log(`🚀 WebSocket server running on ws://localhost:${PORT}`);
	console.log(`💡 To test streaming: send { "type": "stream-test" }`);
});

// Graceful shutdown
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
