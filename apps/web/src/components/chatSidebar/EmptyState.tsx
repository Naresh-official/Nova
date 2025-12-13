import { Button } from "@nova/ui/components/button";
import Image from "next/image";
import React from "react";

function EmptyState() {
	const suggestions = [
		"Find invoice from Stripe",
		"Show unpaid invoices",
		"Find all work meetings",
		"Summarize recent email",
	];

	return (
		<div className="max-w-full">
			<Image
				src="/logo.svg"
				alt="Nova Logo"
				width={64}
				height={64}
				className="mx-auto mb-4"
			/>
			<div className="w-[70%] mx-auto text-center space-y-2">
				<h2 className="font-bold text-muted-foreground">
					Ask anything about your emails
				</h2>
				<h3 className="text-muted-foreground text-sm">
					Ask to do or show anything using natural language
				</h3>
			</div>

			<div className="mt-6">
				<div className="flex flex-col items-center gap-2">
					{suggestions.map((suggestion) => (
						<Button key={suggestion} variant="outline" size="sm">
							{suggestion}
						</Button>
					))}
				</div>
			</div>
		</div>
	);
}

export default EmptyState;
