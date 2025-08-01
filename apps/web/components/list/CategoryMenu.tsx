import { Button } from "@nova/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@nova/ui/components/dropdown-menu";
import { ChevronDown } from "lucide-react";
import React, { useState } from "react";

function CategoryMenu() {
	const [isOpen, setIsOpen] = useState(false);
	const categories = [
		"Important",
		"Forums",
		"Updates",
		"Promotions",
		"Social",
		"Starred",
		"Unread",
	];

	return (
		<DropdownMenu onOpenChange={setIsOpen}>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="flex items-center gap-1" size="sm">
					<span className="text-muted-foreground">Categories</span>
					<ChevronDown
						className={`h-4 w-4 flex text-muted-foreground items-center justify-center transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}
					/>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-48">
				{categories.map((category) => (
					<DropdownMenuItem key={category}>
						<span className="text-muted-foreground">{category}</span>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export default CategoryMenu;
