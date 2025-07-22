import React from "react";
import { FileText, Send, Sparkles } from "lucide-react";

function EmptyState() {
	return (
		<div className="flex h-full w-full flex-col items-center justify-center p-8 text-center">
			<div className="mb-6 flex h-40 w-40 items-center justify-center rounded-full border-2 border-dashed border-gray-700">
				<FileText className="h-20 w-20 text-gray-600" strokeWidth={1} />
			</div>

			<h2 className="text-xl font-semibold text-gray-300">
				It's empty here
			</h2>
			<p className="mt-1 text-sm text-gray-500">
				Choose an email to view details
			</p>

			<div className="mt-6 flex items-center gap-4">
				<button className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600">
					<Sparkles
						className="h-4 w-4 text-purple-400"
						strokeWidth={2}
					/>
					Zero chat
				</button>

				<button className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600">
					<Send className="h-4 w-4" strokeWidth={2} />
					Send email
				</button>
			</div>
		</div>
	);
}

export default EmptyState;
