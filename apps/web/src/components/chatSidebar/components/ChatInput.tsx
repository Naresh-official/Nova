import React from "react";
import { Textarea } from "@nova/ui/components/textarea";
import { ArrowUp, Mic } from "lucide-react";
import { Button } from "@nova/ui/components/button";

function IntelligentInput() {
	return (
		<div className="bg-secondary/80 rounded-lg">
			<Textarea
				className="border-0 !bg-transparent focus-visible:ring-0 focus-visible:outline-0 resize-none max-h-40 scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thin scrollbar-thumb-secondary-foreground scrollbar-track-secondary overflow-y-auto"
				placeholder="Type anything in natural language..."
			/>
			<div className="flex gap-2 mt-2 justify-end pb-2 pr-2">
				<Button variant="ghost" size="icon">
					<Mic />
				</Button>
				<Button variant="ghost" size="icon">
					<ArrowUp />
				</Button>
			</div>
		</div>
	);
}

export default IntelligentInput;
