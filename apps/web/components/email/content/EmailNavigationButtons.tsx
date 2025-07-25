// components/email/EmailNavigationButtons.tsx
import { Button } from "@nova/ui/components/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export function EmailNavigationButtons({
	handleClose,
	handlePrevious,
	handleNext,
	disablePrev,
	disableNext,
}: {
	handleClose: () => void;
	handlePrevious: () => void;
	handleNext: () => void;
	disablePrev: boolean;
	disableNext: boolean;
}) {
	return (
		<div className="flex items-center gap-2">
			<Button
				variant="ghost"
				className="p-2 text-zinc-300"
				onClick={handleClose}
			>
				<X size={20} />
			</Button>
			<div className="w-px h-6 bg-zinc-600 mx-1" />
			<Button
				variant="ghost"
				className="p-2 text-zinc-300"
				onClick={handlePrevious}
				disabled={disablePrev}
			>
				<ChevronLeft size={22} />
			</Button>
			<Button
				variant="ghost"
				className="p-2 text-zinc-300"
				onClick={handleNext}
				disabled={disableNext}
			>
				<ChevronRight size={22} />
			</Button>
		</div>
	);
}
