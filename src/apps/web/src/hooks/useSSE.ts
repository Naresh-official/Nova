import { useEffect, useRef, useState } from "react";

export function useSSE(url: string, inputs?: Record<string, any>) {
	const [data, setData] = useState<string>("");
	const [error, setError] = useState<Error | null>(null);
	const [isStreaming, setIsStreaming] = useState<boolean>(false);
	const eventSourceRef = useRef<EventSource | null>(null);

	const start = () => {
		if (eventSourceRef.current) return; // avoid multiple connections

		setData("");
		setError(null);

		const backendURL = process.env.NEXT_PUBLIC_EXPRESS_BACKEND_URL || "";

		// Build URL with query parameters
		let fullUrl = backendURL + url;
		if (inputs && Object.keys(inputs).length > 0) {
			const params = new URLSearchParams();
			Object.entries(inputs).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					params.append(key, String(value));
				}
			});
			fullUrl += "?" + params.toString();
		}

		const eventSource = new EventSource(fullUrl);
		eventSourceRef.current = eventSource;

		setIsStreaming(true);

		eventSource.onmessage = (e) => {
			setData((prev) => prev + JSON.parse(e.data));
		};

		eventSource.onerror = () => {
			setError(new Error("SSE error"));
			stop();
		};

		eventSource.addEventListener("done", () => {
			stop();
		});
	};

	const stop = () => {
		if (eventSourceRef.current) {
			eventSourceRef.current.close();
			eventSourceRef.current = null;
		}
		setIsStreaming(false);
	};

	// Cleanup on unmount
	useEffect(() => {
		return () => stop();
	}, []);

	return { data, error, start, stop, isStreaming };
}
