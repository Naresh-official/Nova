import { Button } from "@nova/ui/components/button";
import { Paperclip, Image, Smile, Trash2 } from "lucide-react";

export function ComposeFooter({
	handleSend,
	onFileSelect,
	onImagesInsert,
}: {
	handleSend: () => void;
	onFileSelect: (files: File[]) => void;
	onImagesInsert: (base64Images: string[]) => void;
}) {
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		console.log("Files selected:", e.target.files);
		const files = Array.from(e.target.files || []);
		onFileSelect(files);
		e.target.value = "";
	};

	const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		if (!files.length) return;

		console.log("Images selected:", files);

		try {
			const base64Images = await Promise.all(
				files.map((file) => {
					return new Promise<string>((resolve, reject) => {
						const reader = new FileReader();
						reader.onloadend = () => {
							if (typeof reader.result === "string") {
								resolve(reader.result);
							} else {
								reject(new Error("Failed to read file"));
							}
						};
						reader.onerror = reject;
						reader.readAsDataURL(file);
					});
				})
			);

			console.log("Base64 images ready:", base64Images.length);
			onImagesInsert(base64Images);
		} catch (error) {
			console.error("Error processing images:", error);
		}

		e.target.value = "";
	};

	return (
		<div className="flex justify-between items-center p-3 border-t border-[#2A2A2A] bg-[#2A2A2A] rounded-b-lg">
			<div className="flex items-center gap-2">
				<Button
					onClick={handleSend}
					className="font-semibold text-sm h-8 px-4 rounded-full"
				>
					Send
				</Button>

				{/* Attachment Button */}
				<label className="cursor-pointer">
					<input type="file" hidden multiple onChange={handleFileChange} />
					<Button
						variant="ghost"
						size="icon"
						type="button"
						className="text-white/50 hover:text-white hover:bg-[#333]"
						asChild
					>
						<span>
							<Paperclip className="h-4 w-4" />
						</span>
					</Button>
				</label>

				{/* Image Insert Button - Now supports multiple */}
				<label className="cursor-pointer">
					<input
						type="file"
						hidden
						accept="image/*"
						multiple
						onChange={handleImageChange}
					/>
					<Button
						variant="ghost"
						size="icon"
						type="button"
						className="text-white/50 hover:text-white hover:bg-[#333]"
						asChild
					>
						<span>
							<Image className="h-4 w-4" />
						</span>
					</Button>
				</label>

				<Button
					variant="ghost"
					size="icon"
					className="text-white/50 hover:text-white hover:bg-[#333]"
				>
					<Smile className="h-4 w-4" />
				</Button>
			</div>

			<Button
				variant="ghost"
				size="icon"
				className="text-white/50 hover:text-white hover:bg-[#333]"
			>
				<Trash2 className="h-4 w-4" />
			</Button>
		</div>
	);
}
