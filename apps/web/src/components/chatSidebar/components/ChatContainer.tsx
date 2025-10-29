import { format, isToday } from "date-fns";
import React from "react";

interface IMessage {
	role: "agent" | "user";
	type: string;
	message: string;
	timestamp: string;
}

interface IChatContainerProps {
	messages?: IMessage[];
}

function ChatContainer({ messages }: IChatContainerProps) {
	return (
		<div className="flex flex-col gap-2">
			{messages?.map((msg, index) => (
				<MessageNode key={index} message={msg} />
			))}
		</div>
	);
}

function MessageNode({ message }: { message: IMessage }) {
	return (
		<div
			className={`p-2 ${message.role === "user" ? "bg-primary self-end max-w-60 min-w-40" : ""} rounded-xl `}
		>
			<p>{message.message}</p>
		</div>
	);
}

export default ChatContainer;
