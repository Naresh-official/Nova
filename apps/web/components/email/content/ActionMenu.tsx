// components/email/ActionMenu.tsx
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@nova/ui/components/dropdown-menu";
import { Printer, AlertTriangle, UserX, Zap, MoreVertical } from "lucide-react";
import { Button } from "@nova/ui/components/button";

interface ActionMenuProps {
	onPrint: (() => void) | undefined;
	onSpam: () => void;
	onUnsubscribe: () => void;
	onMarkAsImportant: () => void;
}

export function ActionMenu({
	onPrint,
	onSpam,
	onUnsubscribe,
	onMarkAsImportant,
}: ActionMenuProps) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="secondary" className="p-2 text-zinc-300">
					<MoreVertical size={20} />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-48">
				<DropdownMenuItem onClick={onPrint}>
					<Printer size={16} />
					<span>Print</span>
				</DropdownMenuItem>
				<DropdownMenuItem onClick={onSpam}>
					<AlertTriangle size={16} />
					<span>Move to Spam</span>
				</DropdownMenuItem>
				<DropdownMenuItem onClick={onUnsubscribe}>
					<UserX size={16} />
					<span>Unsubscribe</span>
				</DropdownMenuItem>
				<DropdownMenuItem onClick={onMarkAsImportant}>
					<Zap size={16} />
					<span>Mark as Important</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
