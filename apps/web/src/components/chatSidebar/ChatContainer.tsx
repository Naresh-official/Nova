import { differenceInSeconds, format, isToday } from "date-fns";
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
		<div className="flex flex-col justify-start h-full gap-2">
			{messages?.map((msg, index) => (
				<div
					className={`p-2 ${msg.role === "user" ? "bg-primary self-end max-w-60 min-w-40" : "text-foreground"} rounded-xl `}
				>
					<p>{msg.message}</p>
					{msg.role === "agent" && (
						<p className="text-xs my-2 text-muted-foreground">
							Responded in{" "}
							{differenceInSeconds(
								new Date(msg.timestamp),
								new Date(
									messages && index > 0
										? messages[index - 1].timestamp
										: msg.timestamp
								)
							)}{" "}
							seconds{" "}
						</p>
					)}
				</div>
			))}
		</div>
	);
}

export default ChatContainer;
