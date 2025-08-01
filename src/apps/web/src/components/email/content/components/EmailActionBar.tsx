import { EmailNavigationButtons } from "./EmailNavigationButtons";
import { ActionMenu } from "./ActionMenu";
import { Button } from "@nova/ui/components/button";
import {
	AlertDialog,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogFooter,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogCancel,
	AlertDialogAction,
} from "@nova/ui/components/alert-dialog";
import { ReplyAll, Archive, Star, Trash2 } from "lucide-react";
import { useEmailActions } from "../utils/useEmailActions";

function EmailActionBar({ onPrint }: { onPrint?: () => void }) {
	const { currentThreadId, actions, isStarred, disableNext, disablePrev } =
		useEmailActions();

	return (
		<div className="flex items-center justify-between p-2 rounded-lg font-sans">
			<EmailNavigationButtons
				handleClose={actions.handleClose}
				handlePrevious={actions.handlePrevious}
				handleNext={actions.handleNext}
				disablePrev={disablePrev}
				disableNext={disableNext}
			/>

			<div className="flex items-center gap-2">
				<Button
					variant="secondary"
					className="flex items-center gap-2 px-4 py-2 text-zinc-200"
				>
					<ReplyAll size={20} />
					<span className="text-sm font-medium">Reply all</span>
				</Button>

				<Button
					variant="secondary"
					onClick={actions.handleArchive}
					className="p-2 text-zinc-300"
				>
					<Archive size={18} />
				</Button>

				<Button
					variant="secondary"
					onClick={actions.handleToggleStar}
					className="p-2 text-zinc-300"
				>
					<Star size={20} fill={isStarred ? "yellow" : "none"} />
				</Button>

				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button
							variant="secondary"
							className="p-2 text-red-400 hover:bg-red-400/20"
						>
							<Trash2 size={20} />
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Move Email Thread to Trash?</AlertDialogTitle>
							<AlertDialogDescription>
								This email thread will be moved to trash.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction onClick={actions.handleDelete}>
								Move to Trash
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>

				<ActionMenu
					onPrint={onPrint}
					onSpam={actions.handleMoveToSpam}
					onUnsubscribe={actions.handleUnsubscribe}
					onMarkAsImportant={actions.handleMarkAsImportant}
				/>
			</div>
		</div>
	);
}

export default EmailActionBar;
