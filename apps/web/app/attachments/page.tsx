import { NovaSidebar } from "@/components/nova-sidebar";
import { NovaHeader } from "@/components/nova-header";
import { SidebarInset } from "@nova/ui/components/sidebar";

export default function AttachmentsPage() {
	return (
		<div className="flex h-screen bg-[#0D0D0D]">
			<NovaSidebar />
			<SidebarInset className="flex-1 flex flex-col">
				<NovaHeader title="Attachments" />

				<div className="flex-1 flex items-center justify-center animate-fade-in">
					<div className="text-center">
						<div className="w-16 h-16 rounded-full bg-[#2A2A2A] flex items-center justify-center mx-auto mb-4">
							<svg
								className="w-8 h-8 text-[#666]"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
								/>
							</svg>
						</div>
						<h2 className="text-xl font-semibold text-white mb-2">
							No attachments
						</h2>
						<p className="text-[#999] mb-6">
							Email attachments will be organized here
						</p>
					</div>
				</div>
			</SidebarInset>
		</div>
	);
}
