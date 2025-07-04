import { NovaSidebar } from "@/components/Sidebar";
import { NovaHeader } from "@/components/Header";
import { SidebarInset } from "@nova/ui/components/sidebar";

export default function ArchivePage() {
	return (
		<div className="flex h-screen bg-[#0D0D0D]">
			<NovaSidebar />
			<SidebarInset className="flex-1 flex flex-col">
				<NovaHeader title="Archive" />

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
									d="M5 8l6 6 6-6"
								/>
							</svg>
						</div>
						<h2 className="text-xl font-semibold text-white mb-2">
							No archived emails
						</h2>
						<p className="text-[#999] mb-6">
							Your archived emails will appear here
						</p>
					</div>
				</div>
			</SidebarInset>
		</div>
	);
}
