import React, { useRef } from "react";
import { Textarea } from "@nova/ui/components/textarea";
import { ArrowUp, Mic } from "lucide-react";
import { Button } from "@nova/ui/components/button";

interface ChatInputProps {
	sendMessage: (message: string) => void;
}

function ChatInput({ sendMessage }: ChatInputProps) {
	const formRef = useRef<HTMLFormElement | null>(null);

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const message = (formData.get("message") as string) || "";
		if (message.trim()) {
			sendMessage(message);
		}
		event.currentTarget.reset();
	};

	return (
		<div className="bg-secondary/80 rounded-lg">
			<form onSubmit={handleSubmit} ref={formRef}>
				<Textarea
					name="message"
					className="border-0 !bg-transparent focus-visible:ring-0 focus-visible:outline-0 resize-none max-h-40 scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thin scrollbar-thumb-secondary-foreground scrollbar-track-secondary overflow-y-auto"
					placeholder="Type anything in natural language..."
					onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault();
							formRef.current?.requestSubmit?.();
						}
					}}
				/>
				<div className="flex gap-2 mt-2 justify-end pb-2 pr-2">
					<Button variant="ghost" size="icon" type="button" aria-label="Record">
						<Mic />
					</Button>
					<Button variant="ghost" size="icon" type="submit" aria-label="Send">
						<ArrowUp />
					</Button>
				</div>
			</form>
		</div>
	);
}

export default ChatInput;
