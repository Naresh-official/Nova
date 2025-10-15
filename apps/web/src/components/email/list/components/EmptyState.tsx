import React from "react";

interface EmptyStateProps {
	message: string;
}

function EmptyState({ message }: EmptyStateProps) {
	return (
		<div className="flex items-center justify-center h-full text-gray-400">
			{message}
		</div>
	);
}

export default EmptyState;
