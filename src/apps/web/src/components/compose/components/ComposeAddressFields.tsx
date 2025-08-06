import { X } from "lucide-react";
import { useState, type Dispatch, type SetStateAction } from "react";

interface ComposeAddressFieldsProps {
	to: string[];
	setTo: Dispatch<SetStateAction<string[]>>;
	cc: string[];
	setCc: Dispatch<SetStateAction<string[]>>;
	bcc: string[];
	setBcc: Dispatch<SetStateAction<string[]>>;
	userEmail?: string | null;
	userName?: string | null;
}

export function ComposeAddressFields({
	to,
	setTo,
	cc,
	setCc,
	bcc,
	setBcc,
	userEmail,
	userName,
}: ComposeAddressFieldsProps) {
	const [showBcc, setShowBcc] = useState(false);
	const [showCc, setShowCc] = useState(false);
	const [toValue, setToValue] = useState("");
	const [ccValue, setCcValue] = useState("");
	const [bccValue, setBccValue] = useState("");

	const handleRemoveRecipient = (index: number) => {
		setTo((prev) => prev.filter((_, i) => i !== index));
	};

	const handleRemoveCcRecipient = (index: number) => {
		setCc((prev) => prev.filter((_, i) => i !== index));
	};

	const handleRemoveBccRecipient = (index: number) => {
		setBcc((prev) => prev.filter((_, i) => i !== index));
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && toValue.trim()) {
			e.preventDefault();
			setTo((prev) => [...prev, toValue.trim()]);
			setToValue("");
		}
	};

	const handleCcKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && ccValue.trim()) {
			e.preventDefault();
			setCc((prev) => [...prev, ccValue.trim()]);
			setCcValue("");
		}
	};

	const handleBccKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && bccValue.trim()) {
			e.preventDefault();
			setBcc((prev) => [...prev, bccValue.trim()]);
			setBccValue("");
		}
	};

	return (
		<>
			<div className="flex items-center gap-3 border-b border-[#2A2A2A] p-3 text-muted-foreground">
				<span>From</span>
				<span>
					{userName} {"<"}
					{userEmail}
					{">"}
				</span>
			</div>
			<div className="flex items-center border-b border-[#2A2A2A] px-3">
				<span className="text-muted-foreground">To</span>
				<div className="flex flex-1 items-center flex-wrap ml-2">
					{to.map((recipient, index) => (
						<div
							key={index}
							className="text-muted-foreground hover:text-white p-1 px-3 border border-[#333] rounded-full flex gap-2 items-center cursor-pointer mt-1"
						>
							<span className="truncate max-w-[350px]">{recipient}</span>
							<X
								onClick={() => handleRemoveRecipient(index)}
								className="h-4 w-4"
							/>
						</div>
					))}
					<input
						type="text"
						value={toValue}
						onChange={(e) => setToValue(e.target.value)}
						onKeyDown={handleKeyDown}
						className="text-sm p-3 focus:outline-none"
						style={{
							width: `${toValue.length === 0 ? 20 : toValue.length * 9 + 16}px`,
							minWidth: "60px",
							maxWidth: "350px",
						}}
						autoFocus
					/>
				</div>
				<div className="flex items-center gap-2 ml-2 text-muted-foreground">
					{!showCc && (
						<span
							onClick={() => setShowCc((prev) => !prev)}
							className="hover:text-white"
						>
							CC
						</span>
					)}
					{!showBcc && (
						<span
							onClick={() => setShowBcc((prev) => !prev)}
							className="hover:text-white"
						>
							BCC
						</span>
					)}
				</div>
			</div>
			{showCc && (
				<div className="flex items-center border-b border-[#2A2A2A] px-3">
					<span className="text-muted-foreground">CC</span>
					<div className="flex flex-1 items-center flex-wrap ml-2">
						{cc.map((recipient, index) => (
							<div
								key={index}
								className="text-muted-foreground hover:text-white p-1 px-3 border border-[#333] rounded-full flex gap-2 items-center cursor-pointer mt-1"
							>
								<span className="truncate max-w-[350px]">{recipient}</span>
								<X
									onClick={() => handleRemoveCcRecipient(index)}
									className="h-4 w-4"
								/>
							</div>
						))}
						<input
							type="text"
							value={ccValue}
							onChange={(e) => setCcValue(e.target.value)}
							onKeyDown={handleCcKeyDown}
							className="flex-1 min-w-0 w-0 text-sm p-3 focus:outline-none"
							style={{ minWidth: "208px" }}
						/>
					</div>
				</div>
			)}
			{showBcc && (
				<div className="flex items-center border-b border-[#2A2A2A] px-3">
					<span className="text-muted-foreground">BCC</span>
					<div className="flex flex-1 items-center flex-wrap ml-2">
						{bcc.map((recipient, index) => (
							<div
								key={index}
								className="text-muted-foreground hover:text-white p-1 px-3 border border-[#333] rounded-full flex gap-2 items-center cursor-pointer mt-1"
							>
								<span className="truncate max-w-[350px]">{recipient}</span>
								<X
									onClick={() => handleRemoveBccRecipient(index)}
									className="h-4 w-4"
								/>
							</div>
						))}
						<input
							type="text"
							value={bccValue}
							onChange={(e) => setBccValue(e.target.value)}
							onKeyDown={handleBccKeyDown}
							className="flex-1 min-w-0 w-0 text-sm p-3 focus:outline-none"
							style={{ minWidth: "208px" }}
						/>
					</div>
				</div>
			)}
		</>
	);
}
