import { Button } from "@nova/ui/components/button";
import { Minus, Maximize2, Minimize2, X } from "lucide-react";

export function ComposeHeader({
	isExpanded,
	isMinimized,
	toggleExpand,
	onClose,
	onMinimize,
	onHeaderClick,
}: {
	isExpanded: boolean;
	isMinimized: boolean;
	toggleExpand: () => void;
	onClose: () => void;
	onMinimize: () => void;
	onHeaderClick: () => void;
}) {
	return (
		<div
			className={`flex justify-between items-center bg-secondary px-4 py-2 rounded-t-lg ${
				isMinimized ? "cursor-pointer hover:bg-secondary/80" : ""
			}`}
			onClick={isMinimized ? onHeaderClick : undefined}
		>
			<h2 className="text-sm font-semibold text-white">New Message</h2>
			<div className="flex items-center gap-2">
				{!isMinimized && (
					<Button
						onClick={onMinimize}
						variant="ghost"
						size="icon"
						className="h-6 w-6 text-white/50 hover:text-white hover:bg-[#333]"
					>
						<Minus className="h-4 w-4" />
					</Button>
				)}
				{!isMinimized && (
					<Button
						onClick={toggleExpand}
						variant="ghost"
						size="icon"
						className="h-6 w-6 text-white/50 hover:text-white hover:bg-[#333]"
					>
						{isExpanded ? (
							<Minimize2 className="h-4 w-4" />
						) : (
							<Maximize2 className="h-4 w-4" />
						)}
					</Button>
				)}
				<Button
					onClick={onClose}
					variant="ghost"
					size="icon"
					className="h-6 w-6 text-white/50 hover:text-white hover:bg-red-500"
				>
					<X className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
