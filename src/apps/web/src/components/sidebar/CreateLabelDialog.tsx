import { Button } from "@nova/ui/components/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@nova/ui/components/dialog";
import { Input } from "@nova/ui/components/input";
import { useState } from "react";
import { trpc } from "@/lib/client";
import { toast } from "sonner";
import React from "react";
import { Plus } from "lucide-react";
import { LABEL_COLORS } from "@/lib/labelColors";

function CreateLabelDialog() {
	const createLabel = trpc.labels.createLabel.useMutation();
	const utils = trpc.useUtils();

	const [labelName, setLabelName] = useState("");
	const [selectedColor, setSelectedColor] = useState("");
	const [open, setOpen] = useState(false);

	const handleCreateLabel = () => {
		const color = LABEL_COLORS.find((c) => c.backgroundColor === selectedColor);
		const payload: { name: string; color?: typeof color } = {
			name: labelName,
		};

		if (selectedColor && color) {
			payload.color = color;
		}

		createLabel.mutate(payload, {
			onSuccess: () => {
				toast.success("Label created successfully");
				setLabelName("");
				setSelectedColor("");
				setOpen(false);
				utils.labels.getLabels.invalidate();
			},
		});
	};
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					className="hover:bg-[#2A2A2A] h-6 w-6 transition-colors"
				>
					<Plus className="w-6 h-6 text-muted-foreground ml-auto" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[400px]">
				<DialogHeader>
					<DialogTitle>Create New Label</DialogTitle>
					<DialogDescription>
						Add a label name and choose a color.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium mb-1">Label Name</label>
						<Input
							placeholder="Enter label name"
							value={labelName}
							onChange={(e) => setLabelName(e.target.value)}
							className="border-0 focus-visible:ring-0 focus-visible:outline-0"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">Color</label>
						<div className="flex gap-2">
							{LABEL_COLORS.map((color) => (
								<button
									key={color.backgroundColor}
									type="button"
									className={`w-6 h-6 rounded-sm border ${
										selectedColor === color.backgroundColor
											? "ring-2 ring-offset-1 ring-white"
											: ""
									}`}
									style={{ backgroundColor: color.backgroundColor }}
									onClick={() => setSelectedColor(color.backgroundColor)}
								/>
							))}
						</div>
					</div>
				</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button
							variant="secondary"
							onClick={() => {
								setLabelName("");
								setSelectedColor("");
							}}
						>
							Cancel
						</Button>
					</DialogClose>
					<Button onClick={handleCreateLabel} disabled={createLabel.isPending}>
						{createLabel.isPending ? "Creating..." : "Create Label"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default CreateLabelDialog;
