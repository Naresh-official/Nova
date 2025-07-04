import { NovaSidebar } from "@/components/nova-sidebar";
import { NovaHeader } from "@/components/nova-header";
import { SidebarInset } from "@nova/ui/components/sidebar";

export default function TemplatesPage() {
	return (
		<div className="flex h-screen bg-[#0D0D0D]">
			<NovaSidebar />
			<SidebarInset className="flex-1 flex flex-col">
				<NovaHeader title="Templates" />

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
									d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/>
							</svg>
						</div>
						<h2 className="text-xl font-semibold text-white mb-2">
							No templates yet
						</h2>
						<p className="text-[#999] mb-6">
							AI-generated email templates will appear here
						</p>
					</div>
				</div>
			</SidebarInset>
		</div>
	);
}
