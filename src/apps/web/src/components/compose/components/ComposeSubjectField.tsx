interface Props {
	subject: string;
	setSubject: (subject: string) => void;
}

export function ComposeSubjectField({ subject, setSubject }: Props) {
	return (
		<div className="flex border-b border-[#2A2A2A]">
			<input
				type="text"
				placeholder="Subject"
				value={subject}
				onChange={(e) => setSubject(e.target.value)}
				className="w-full bg-transparent text-sm text-white placeholder:text-[#999] p-3 focus:outline-none"
			/>
		</div>
	);
}
