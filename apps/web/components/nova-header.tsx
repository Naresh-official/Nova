"use client";

import { Search } from "lucide-react";
import { Input } from "@nova/ui/components/input";

interface NovaHeaderProps {
	title?: string;
}

export function NovaHeader({ title }: NovaHeaderProps) {
	return (
		<header className="border-b border-[#2A2A2A] bg-[#0D0D0D] p-3">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4 flex-1">
					{title && (
						<h1 className="text-xl font-semibold text-white">
							{title}
						</h1>
					)}

					<div className="flex items-center gap-2 max-w-md flex-1">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#666]" />
							<Input
								placeholder="Search & Filter"
								className="nova-input pl-10 bg-[#1A1A1A] border-[#2A2A2A] focus-visible:ring-0 focus-visible:outline-0"
							/>
						</div>
					</div>
				</div>
			</div>
		</header>
	);
}
