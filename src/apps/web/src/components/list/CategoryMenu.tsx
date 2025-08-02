"use client";

import { Button } from "@nova/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@nova/ui/components/dropdown-menu";
import { ChevronDown, Check } from "lucide-react";
import React, { useState } from "react";
import { useQueryStore } from "../providers/QueryStoreProvider";

function CategoryMenu() {
	const [isOpen, setIsOpen] = useState(false);
	const labelIds = useQueryStore((state) => state.labelIds);
	const addLabelId = useQueryStore((state) => state.addLabelId);
	const removeLabelId = useQueryStore((state) => state.removeLabelId);

	const categories = [
		{ name: "Important", labelId: "IMPORTANT" },
		{ name: "Starred", labelId: "STARRED" },
		{ name: "Unread", labelId: "UNREAD" },
		{ name: "Personal", labelId: "CATEGORY_PERSONAL" },
		{ name: "Social", labelId: "CATEGORY_SOCIAL" },
		{ name: "Updates", labelId: "CATEGORY_UPDATES" },
		{ name: "Forums", labelId: "CATEGORY_FORUMS" },
		{ name: "Promotions", labelId: "CATEGORY_PROMOTIONS" },
	];

	const handleCategoryClick = (event: React.MouseEvent, labelId: string) => {
		event.preventDefault();
		event.stopPropagation();

		if (labelIds.includes(labelId)) {
			removeLabelId(labelId);
		} else {
			addLabelId(labelId);
		}
	};

	return (
		<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
			<DropdownMenuTrigger
				asChild
				className="focus-visible:ring-0 focus-visible:outline-0 focus-visible:border-input"
			>
				<Button variant="ghost" className="flex items-center gap-1" size="sm">
					<span className="text-muted-foreground">Categories</span>
					<ChevronDown
						className={`h-4 w-4 flex text-muted-foreground items-center justify-center transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}
					/>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-48">
				{categories.map((category) => (
					<DropdownMenuItem
						key={category.labelId}
						onSelect={(event) => event.preventDefault()}
						onClick={(event) => handleCategoryClick(event, category.labelId)}
						className="flex items-center justify-between cursor-pointer"
					>
						<span className="text-muted-foreground">{category.name}</span>
						{labelIds.includes(category.labelId) && (
							<Check className="h-4 w-4" />
						)}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export default CategoryMenu;
