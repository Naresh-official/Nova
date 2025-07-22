import React from "react";
import {
	X,
	ChevronLeft,
	ChevronRight,
	ReplyAll,
	Archive,
	Star,
	Trash2,
	MoreVertical,
} from "lucide-react";
import { Button } from "@nova/ui/components/button";

function EmailActionBar() {
	return (
		<div className="flex items-center justify-between p-2 rounded-lg font-sans">
			{/* Left side controls */}
			<div className="flex items-center gap-2">
				<Button variant="ghost" className="p-2 text-zinc-300">
					<X size={20} />
				</Button>
				<div className="w-px h-6 bg-zinc-600 mx-1"></div>
				<Button variant="ghost" className="p-2 text-zinc-300">
					<ChevronLeft size={22} />
				</Button>
				<Button variant="ghost" className="p-2 text-zinc-300">
					<ChevronRight size={22} />
				</Button>
			</div>

			<div className="flex items-center gap-2">
				<Button
					variant="secondary"
					className="flex items-center gap-2 px-4 py-2 text-zinc-200"
				>
					<ReplyAll size={20} />
					<span className="text-sm font-medium">Reply all</span>
				</Button>
				<Button variant="secondary" className="p-2 text-zinc-300">
					<Archive size={18} />
				</Button>
				<Button variant="secondary" className="p-2 text-zinc-300">
					<Star size={20} />
				</Button>
				<Button
					variant="secondary"
					className="p-2 text-red-400 hover:bg-red-400/20"
				>
					<Trash2 size={20} />
				</Button>
				<Button variant="secondary" className="p-2 text-zinc-300">
					<MoreVertical size={20} />
				</Button>
			</div>
		</div>
	);
}

export default EmailActionBar;
