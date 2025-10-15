"use client"; // only if you're in Next.js App Router

import { useEffect, useState } from "react";

export default function SSEStream() {
	const [messages, setMessages] = useState<string>("");
	const [done, setDone] = useState(false);

	useEffect(() => {
		const eventSource = new EventSource("http://localhost:8000/sse");

		// Normal data messages
		eventSource.onmessage = (event) => {
			setMessages((prev) => prev + " " + event.data);
		};

		// ✅ Handle the "done" event
		eventSource.addEventListener("done", (event) => {
			console.log("✅ Stream finished:", event.data);
			setDone(true);
			eventSource.close();
		});

		eventSource.onerror = (err) => {
			console.error("SSE error (connection closed):", err);
			eventSource.close();
		};

		return () => {
			eventSource.close();
		};
	}, []);

	return (
		<div style={{ padding: "20px", fontFamily: "monospace" }}>
			<h2>📡 SSE Stream</h2>
			<div>{messages}</div>
			{done && <p style={{ color: "green" }}>✅ Stream finished!</p>}
		</div>
	);
}
