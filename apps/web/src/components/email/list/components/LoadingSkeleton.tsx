import React from "react";
import { Skeleton } from "@nova/ui/components/skeleton";

function LoadingSkeleton() {
	return (
		<div className="space-y-3 p-4">
			{Array.from({ length: 10 }).map((_, index) => (
				<div key={index} className="flex items-start space-x-3 p-3">
					<Skeleton className="h-10 w-10 rounded-full" />
					<div className="space-y-2 flex-1">
						<Skeleton className="h-4 w-3/4" />
						<Skeleton className="h-3 w-full" />
					</div>
					<Skeleton className="h-3 w-12" />
				</div>
			))}
		</div>
	);
}

export default LoadingSkeleton;
