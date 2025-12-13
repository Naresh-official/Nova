import React from "react";
import { Button } from "@nova/ui/components/button";
import { Expand, PictureInPicture, Plus, X } from "lucide-react";

interface ChatHeaderBarProps {
	closeChat: () => void;
	toggleExpand: () => void;
	togglePoppedOut: () => void;
	startNewChat: () => void;
}

function ChatHeaderBar({
	closeChat,
	toggleExpand,
	togglePoppedOut,
	startNewChat,
}: ChatHeaderBarProps) {
	return (
		<div className="flex justify-between items-center mb-4">
			<div>
				<Button
					variant="secondary"
					size="icon"
					className="h-7 w-7"
					onClick={closeChat}
				>
					<X />
				</Button>
			</div>
			<div className="flex items-center gap-2">
				<Button
					variant="secondary"
					size="icon"
					className="h-7 w-7"
					onClick={toggleExpand}
				>
					<Expand />
				</Button>
				<Button
					variant="secondary"
					size="icon"
					className="h-7 w-7"
					onClick={togglePoppedOut}
				>
					<PictureInPicture />
				</Button>
				<Button
					variant="secondary"
					size="icon"
					className="h-7 w-7"
					onClick={startNewChat}
				>
					<Plus />
				</Button>
			</div>
		</div>
	);
}

export default ChatHeaderBar;
