import React from "react";
import IntelligentHeaderBar from "./ChatHeaderBar";
import EmptyState from "./EmptyState";
import IntelligentInput from "./ChatInput";
import { useChatNavigation } from "../hooks/useChatNavigation";
import { useAgentWebSocket } from "@/hooks/useAgentWebSocket";
import ChatContainer from "./ChatContainer";

function IntelligentSidebar() {
	const { closeChat, toggleExpand, togglePoppedOut, startNewChat } =
		useChatNavigation();

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
			<IntelligentHeaderBar
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

			<IntelligentInput sendMessage={sendMessage} />
		</div>
	);
}

export default IntelligentSidebar;
