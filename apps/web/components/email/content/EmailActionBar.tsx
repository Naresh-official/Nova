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
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { trpc } from "@/lib/client";

function EmailActionBar() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const currentThreadId = searchParams.get("threadId");

	const { data: emails } = trpc.threads.listThreadIds.useQuery();

	const handleClose = () => {
		router.push(pathname);
	};

	const handlePrevious = () => {
		if (!emails || !currentThreadId) return;

		const currentIndex = emails.findIndex(
			(email) => email === currentThreadId
		);
		if (currentIndex > 0) {
			const previousThreadId = emails[currentIndex - 1];
			router.push(`${pathname}?threadId=${previousThreadId}`);
		}
	};

	const handleNext = () => {
		if (!emails || !currentThreadId) return;

		const currentIndex = emails.findIndex(
			(email) => email === currentThreadId
		);
		if (currentIndex < emails.length - 1) {
			const nextThreadId = emails[currentIndex + 1];
			router.push(`${pathname}?threadId=${nextThreadId}`);
		}
	};

	return (
		<div className="flex items-center justify-between p-2 rounded-lg font-sans">
			{/* Left side controls */}
			<div className="flex items-center gap-2">
				<Button
					variant="ghost"
					className="p-2 text-zinc-300"
					onClick={handleClose}
				>
					<X size={20} />
				</Button>
				<div className="w-px h-6 bg-zinc-600 mx-1"></div>
				<Button
					variant="ghost"
					className="p-2 text-zinc-300"
					onClick={handlePrevious}
					disabled={
						!emails ||
						!currentThreadId ||
						emails.findIndex(
							(email) => email === currentThreadId
						) === 0
					}
				>
					<ChevronLeft size={22} />
				</Button>
				<Button
					variant="ghost"
					className="p-2 text-zinc-300"
					onClick={handleNext}
					disabled={
						!emails ||
						!currentThreadId ||
						emails.findIndex(
							(email) => email === currentThreadId
						) ===
							emails.length - 1
					}
				>
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
