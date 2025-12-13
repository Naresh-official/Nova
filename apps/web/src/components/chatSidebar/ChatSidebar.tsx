import React from "react";
import ChatHeaderBar from "./ChatHeaderBar";
import EmptyState from "./EmptyState";
import ChatInput from "./ChatInput";
import { useChatNavigationStore } from "@/components/providers/ChatNavigationProvider";
import { useAgentWebSocket } from "@/hooks/useAgentWebSocket";
import ChatContainer from "./ChatContainer";

function ChatSidebar() {
	const closeChat = useChatNavigationStore((state) => state.closeChat);
	const toggleExpand = useChatNavigationStore((state) => state.toggleExpand);
	const togglePoppedOut = useChatNavigationStore(
		(state) => state.togglePoppedOut
	);
	const startNewChat = useChatNavigationStore((state) => state.startNewChat);

	const { isConnected, messages, sendMessage, disconnect } = useAgentWebSocket({
		onError: (error) => {
			console.error("WebSocket error:", error);
		},
		onClose: (event) => {
			console.log("WebSocket closed:", event.code, event.reason);
		},
		autoConnect: true,
	});

	return (
		<div className="bg-black rounded-lg scroll-container p-2 min-w-80 w-80 sm:h-[calc(100vh-18px)] flex flex-col justify-between">
			<ChatHeaderBar
				closeChat={() => {
					disconnect();
					closeChat();
				}}
				toggleExpand={toggleExpand}
				togglePoppedOut={togglePoppedOut}
				startNewChat={startNewChat}
			/>
			{isConnected && messages.length > 1 ? (
				<ChatContainer messages={messages.slice(1)} />
			) : (
				<EmptyState />
			)}

			<ChatInput sendMessage={sendMessage} />
		</div>
	);
}

export default ChatSidebar;
