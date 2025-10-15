import React from "react";
import { LoaderCircle } from "lucide-react";

function InfiniteScrollLoader() {
	return (
		<div className="flex justify-center items-center h-16">
			<LoaderCircle className="animate-spin" />
		</div>
	);
}

export default InfiniteScrollLoader;
