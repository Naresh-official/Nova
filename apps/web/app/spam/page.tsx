import { NovaSidebar } from "@/components/Sidebar";
import { NovaHeader } from "@/components/Header";
import { SidebarInset } from "@nova/ui/components/sidebar";

export default function SpamPage() {
	return (
		<div className="flex h-screen bg-[#0D0D0D]">
			<NovaSidebar />
			<SidebarInset className="flex-1 flex flex-col">
				<NovaHeader title="Spam" />

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
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
								/>
							</svg>
						</div>
						<h2 className="text-xl font-semibold text-white mb-2">
							No spam emails
						</h2>
						<p className="text-[#999] mb-6">
							Spam emails will be filtered here
						</p>
					</div>
				</div>
			</SidebarInset>
		</div>
	);
}
