import { useStream } from "@/hooks/useStream";
import { Button } from "@nova/ui/components/button";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { useEffect, type Dispatch, type SetStateAction } from "react";

interface Props {
	subject: string;
	setSubject: Dispatch<SetStateAction<string>>;
	body: string;
}

export function ComposeSubjectField({ subject, setSubject, body }: Props) {
	const { data, start, stop, isStreaming, error } = useStream(
		"/ai/generate-subject"
	);

	useEffect(() => {
		if (data) {
			setSubject(data);
		}
	}, [data, setSubject]);

	if (error) {
		toast.error("Failed to generate subject", {
			description:
				error.message || "An error occurred while generating the subject",
		});
	}

	return (
		<div className="flex items-center border-b border-[#2A2A2A] relative">
			<input
				type="text"
				placeholder={isStreaming ? "" : "Subject"}
				value={isStreaming ? "" : subject}
				onChange={(e) => setSubject(e.target.value)}
				className="w-full bg-transparent text-sm text-white placeholder:text-[#999] p-3 focus:outline-none"
			/>

			{/* Loading dots overlay */}
			{isStreaming && (
				<span className="absolute left-3 top-1/2 -translate-y-1/2 flex space-x-1">
					<span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
					<span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
					<span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" />
				</span>
			)}

			<Button
				onClick={() => start({ emailBody: body })}
				variant="ghost"
				size="sm"
				disabled={isStreaming || body.trim().length === 0}
				className="mx-2"
			>
				<Sparkles className="cursor-pointer text-muted-foreground" />
			</Button>
		</div>
	);
}
