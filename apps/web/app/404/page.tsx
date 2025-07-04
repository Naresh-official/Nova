import Link from "next/link";
import { Button } from "@nova/ui/components/button";

export default function NotFoundPage() {
	return (
		<div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
			<div className="text-center animate-fade-in">
				<div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-3xl mx-auto mb-8">
					N
				</div>

				<h1 className="text-6xl font-bold text-white mb-4">404</h1>
				<h2 className="text-2xl font-semibold text-[#E0E0E0] mb-4">
					Page Not Found
				</h2>
				<p className="text-[#999] mb-8 max-w-md mx-auto">
					The page you're looking for doesn't exist or has been moved.
				</p>

				<Link href="/inbox">
					<Button className= glow-on-hover">
						Return to Inbox
					</Button>
				</Link>
			</div>
		</div>
	);
}
