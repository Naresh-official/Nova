import { useEffect, useRef, useState } from "react";

export function useStream(url: string) {
	const [data, setData] = useState<string>("");
	const [error, setError] = useState<Error | null>(null);
	const [isStreaming, setIsStreaming] = useState<boolean>(false);
	const controllerRef = useRef<AbortController | null>(null);

	const start = async (inputs?: Record<string, any>) => {
		if (isStreaming) return;

		setData("");
		setError(null);
		setIsStreaming(true);

		const backendURL = process.env.NEXT_PUBLIC_EXPRESS_BACKEND_URL || "";
		controllerRef.current = new AbortController();

		try {
			const res = await fetch(backendURL + url, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(inputs || {}),
				signal: controllerRef.current.signal,
			});

			if (!res.ok) {
				throw new Error(`HTTP ${res.status}: ${res.statusText}`);
			}
			if (!res.body) {
				throw new Error("No response body received");
			}

			const reader = res.body.getReader();
			const decoder = new TextDecoder();

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value, { stream: true });

				chunk.split("\n").forEach((line) => {
					if (line.startsWith("data:")) {
						const raw = line.replace(/^data:\s?/, "").trim();

						if (raw && raw !== "Stream complete") {
							try {
								const parsed = JSON.parse(raw);
								setData((prev) => prev + parsed);
							} catch {
								setData((prev) => prev + raw);
							}
						}
					}

					// Handle server-sent error events
					if (line.startsWith("event: error")) {
						const errorMsg = line.replace(/^event:\s?error/, "").trim();
						setError(new Error(errorMsg || "Unknown server error"));
					}
				});
			}
		} catch (err: any) {
			if (err.name !== "AbortError") {
				setError(err instanceof Error ? err : new Error(String(err)));
			}
		} finally {
			setIsStreaming(false);
		}
	};

	const stop = () => {
		controllerRef.current?.abort();
		setIsStreaming(false);
	};

	const reset = () => {
		stop();
		setData("");
		setError(null);
		setIsStreaming(false);
	};

	useEffect(() => stop, []);

	return { data, error, start, stop, isStreaming, reset };
}
