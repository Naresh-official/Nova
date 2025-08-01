import { Button } from "@nova/ui/components/button";

function DialogItem({
	text,
	onClick,
	icon,
}: {
	text: string;
	onClick: () => void;
	icon?: React.ReactNode;
}) {
	return (
		<Button
			onClick={onClick}
			variant="ghost"
			className="w-full flex justify-start items-center gap-2"
		>
			{icon && <span className="text-muted-foreground">{icon}</span>}
			{text}
		</Button>
	);
}

export default DialogItem;
