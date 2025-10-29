"use client";

import { useEffect, useRef, useState } from "react";

interface UseAgentWebSocketOptions {
	onError?: (error: Event) => void;
	onClose?: (event: CloseEvent) => void;
	autoConnect?: boolean;
	reconnect?: boolean;
	reconnectInterval?: number; // ms
}

export function useAgentWebSocket(options: UseAgentWebSocketOptions = {}) {
	const {
		onError,
		onClose,
		autoConnect = true,
		reconnect = true,
		reconnectInterval = 3000,
	} = options;

	const [isConnected, setIsConnected] = useState(false);
	const wsRef = useRef<WebSocket | null>(null);
	const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

	const [messages, setMessages] = useState<
		{
			role: "agent" | "user";
			type: string;
			message: string;
			timestamp: string;
		}[]
	>([]);

	const connect = () => {
		if (wsRef.current?.readyState === WebSocket.OPEN) return;

		// Convert to WebSocket protocol
		const wsUrl = process.env.NEXT_PUBLIC_AGENT_URL!;

		try {
			const ws = new WebSocket(wsUrl);

			if (!ws) {
				console.error("WebSocket creation failed");
				return;
			}

			ws.onopen = () => {
				console.log("✅ WebSocket connected to:", wsUrl);
				setIsConnected(true);

				// Clear any previous reconnection attempts
				if (reconnectTimeout.current) {
					clearTimeout(reconnectTimeout.current);
					reconnectTimeout.current = null;
				}
			};

			ws.onmessage = (event) => {
				try {
					const data = JSON.parse(event.data);
					setMessages((prevMessages) => [...prevMessages, data]);
				} catch (err) {
					console.error("Failed to parse WebSocket message:", err, event.data);
				}
			};

			ws.onerror = (event) => {
				console.error("❌ WebSocket error event:", event);
				onError?.(event);
			};

			ws.onclose = (event) => {
				console.warn("⚠️ WebSocket closed:", event.code, event.reason);
				setIsConnected(false);

				setMessages([]);

				onClose?.(event);

				if (reconnect && !event.wasClean) {
					console.log(
						`🔁 Attempting reconnect in ${reconnectInterval / 1000}s...`
					);
					reconnectTimeout.current = setTimeout(connect, reconnectInterval);
				}
			};

			wsRef.current = ws;
		} catch (err) {
			console.error("🚫 Failed to create WebSocket connection:", err);
			if (reconnect) {
				reconnectTimeout.current = setTimeout(connect, reconnectInterval);
			}
		}
	};

	const disconnect = () => {
		if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
		if (wsRef.current) {
			setMessages([]);
			wsRef.current.close();
			wsRef.current = null;
			setIsConnected(false);
		}
	};

	const sendMessage = (message: string) => {
		if (wsRef.current?.readyState === WebSocket.OPEN) {
			setMessages((prevMessages) => [
				...prevMessages,
				{
					role: "user",
					type: "message",
					message: message,
					timestamp: new Date().toISOString(),
				},
			]);
			wsRef.current.send(JSON.stringify(message));
		} else {
			console.warn("WebSocket is not connected, message not sent:", message);
		}
	};

	useEffect(() => {
		if (autoConnect) {
			const timeout = setTimeout(connect, 1000);
			return () => clearTimeout(timeout);
		}
		return () => disconnect();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [autoConnect]);

	return {
		isConnected,
		connect,
		messages,
		disconnect,
		sendMessage,
	};
}
