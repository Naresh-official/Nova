import { NovaSidebar } from "@/components/nova-sidebar";
import { NovaHeader } from "@/components/nova-header";
import { SidebarInset } from "@nova/ui/components/sidebar";

export default function BinPage() {
	return (
		<div className="flex h-screen bg-[#0D0D0D]">
			<NovaSidebar />
			<SidebarInset className="flex-1 flex flex-col">
				<NovaHeader title="Bin" />

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
									d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
								/>
							</svg>
						</div>
						<h2 className="text-xl font-semibold text-white mb-2">
							Bin is empty
						</h2>
						<p className="text-[#999] mb-6">
							Deleted emails will appear here
						</p>
					</div>
				</div>
			</SidebarInset>
		</div>
	);
}
