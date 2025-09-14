import { X, FileText, Image, Paperclip } from "lucide-react";

interface ComposeAttachmentsProps {
	attachments: File[];
	onRemove: (index: number) => void;
}

export function ComposeAttachments({
	attachments,
	onRemove,
}: ComposeAttachmentsProps) {
	if (attachments.length === 0) return null;

	const getFileIcon = (file: File) => {
		if (file.type.startsWith("image/")) {
			return <Image className="w-3 h-3 text-blue-400" />;
		}
		if (file.type.includes("pdf") || file.type.includes("document")) {
			return <FileText className="w-3 h-3 text-green-400" />;
		}
		return <Paperclip className="w-3 h-3 text-gray-400" />;
	};

	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	};

	return (
		<div className="px-3 py-2 border-t border-[#2A2A2A] text-sm text-white space-y-2">
			<div className="flex items-center gap-2">
				<Paperclip className="w-4 h-4 text-white/70" />
				<p className="text-white/70 font-medium">
					{attachments.length} attachment{attachments.length > 1 ? "s" : ""}
				</p>
			</div>
			<div className="space-y-1">
				{attachments.map((file, index) => (
					<div
						key={index}
						className="flex items-center justify-between bg-[#292929] px-3 py-2 rounded-md group hover:bg-[#333333] transition-colors"
					>
						<div className="flex items-center gap-2 min-w-0 flex-1">
							{getFileIcon(file)}
							<div className="min-w-0 flex-1">
								<p className="truncate text-white font-medium text-xs">
									{file.name}
								</p>
								<p className="text-white/50 text-xs">
									{formatFileSize(file.size)}
								</p>
							</div>
						</div>
						<button
							className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-400/10"
							onClick={() => onRemove(index)}
							title="Remove attachment"
						>
							<X className="w-3 h-3" />
						</button>
					</div>
				))}
			</div>
		</div>
	);
}
