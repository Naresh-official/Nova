import React from "react";
import { FileText, Send, Sparkles } from "lucide-react";
import { Button } from "@nova/ui/components/button";
import { useRouter, useSearchParams } from "next/navigation";

function EmptyState() {
	const searchParams = useSearchParams();
	const router = useRouter();

	const handleComposeClick = () => {
		const params = new URLSearchParams(searchParams?.toString() || "");
		params.set("isComposeOpen", "true");
		router.push(`?${params.toString()}`);
	};
	return (
		<div className="flex h-full w-full flex-col items-center justify-center p-8 text-center">
			<div className="mb-6 flex h-40 w-40 items-center justify-center rounded-full border-2 border-dashed border-gray-700">
				<FileText className="h-20 w-20 text-gray-600" strokeWidth={1} />
			</div>

			<h2 className="text-xl font-semibold text-gray-300">It's empty here</h2>
			<p className="mt-1 text-sm text-gray-500">
				Choose an email to view details
			</p>

			<div className="mt-6 flex items-center gap-4">
				<Button variant="secondary">
					<Sparkles className="h-4 w-4 text-purple-400" strokeWidth={2} />
					Zero chat
				</Button>

				<Button variant="secondary" onClick={handleComposeClick}>
					<Send className="h-4 w-4" strokeWidth={2} />
					Send email
				</Button>
			</div>
		</div>
	);
}

export default EmptyState;
