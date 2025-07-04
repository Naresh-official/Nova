"use client";

import { useState } from "react";
import Link from "next/link";
import { NovaHeader } from "@/components/nova-header";
import { Badge } from "@nova/ui/components/badge";
import { formatDistanceToNow } from "date-fns";

const emails = [
	{
		id: "1",
		sender: "Upstash",
		subject:
			"Action Required: Upstash Redis Database Inactivity First Notice",
		preview:
			"Hi there, We've noticed that your free tier Database Zero, has been inactive recently.",
		time: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
		unread: true,
		important: true,
		avatar: "U",
	},
	{
		id: "2",
		sender: "Nizzy",
		subject: "Search your inbox like you talk",
		preview: "Search your inbox like you talk 🧠🔍",
		time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
		unread: true,
		avatar: "N",
	},
	{
		id: "3",
		sender: "Framer",
		subject: "Welcome to Framer! (1 of 4)",
		preview: "Welcome to Framer! (1 of 4)",
		time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
		unread: false,
		avatar: "F",
	},
	{
		id: "4",
		sender: "Google Gemini",
		subject: "Naresh, it's been a while. Check out what's new...",
		preview: "Naresh, it's been a while. Check out what's new...",
		time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
		unread: false,
		avatar: "G",
	},
	{
		id: "5",
		sender: "Codebasics",
		subject: "Want to Gain Real-World Experience? Join the...",
		preview: "Want to Gain Real-World Experience? Join the...",
		time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
		unread: false,
		avatar: "C",
	},
];

export default function InboxPage() {
	const [selectedEmail, setSelectedEmail] = useState(emails[0]);

	return (
		<div className="flex h-screen bg-[#0D0D0D] w-full">
			<div className="flex-1 flex">
				{/* Email List */}
				<div className="w-96 border-r border-[#2A2A2A] bg-[#0D0D0D]">
					<NovaHeader />
					<div className="overflow-y-auto">
						{emails.map((email) => (
							<div
								key={email.id}
								onClick={() => setSelectedEmail(email)}
								className={`p-4 border-b border-[#1A1A1A] cursor-pointer transition-all duration-200 hover:bg-[#1A1A1A] ${
									selectedEmail?.id === email.id
										? "bg-[#1A1A1A] border-l-2 border-l-blue-400"
										: ""
								}`}
							>
								<div className="flex items-start gap-3">
									<div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
										{email.avatar}
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-center justify-between mb-1">
											<span
												className={`text-sm font-medium ${email.unread ? "text-white" : "text-[#E0E0E0]"}`}
											>
												{email.sender}
											</span>
											<span className="text-xs text-[#999]">
												{formatDistanceToNow(
													email.time,
													{ addSuffix: true }
												)}
											</span>
										</div>
										<h3
											className={`text-sm mb-1 line-clamp-1 ${email.unread ? "text-white font-medium" : "text-[#E0E0E0]"}`}
										>
											{email.subject}
										</h3>
										<p className="text-xs text-[#999] line-clamp-2">
											{email.preview}
										</p>
										{email.unread && (
											<div className="flex items-center gap-2 mt-2">
												<div className="w-2 h-2 rounded-full bg-blue-400"></div>
												{email.important && (
													<Badge
														variant="secondary"
														className="text-xs bg-orange-500/20 text-orange-400 border-orange-500/30"
													>
														Important
													</Badge>
												)}
											</div>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Email Content */}
				<div className="flex-1 flex flex-col bg-[#0D0D0D]">
					{selectedEmail && (
						<div className="flex-1 animate-fade-in">
							<div className="p-6 border-b border-[#2A2A2A]">
								<div className="flex items-start justify-between mb-4">
									<div>
										<h1 className="text-xl font-semibold text-white mb-2">
											{selectedEmail.subject}
										</h1>
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-medium">
												{selectedEmail.avatar}
											</div>
											<div>
												<div className="text-sm font-medium text-white">
													{selectedEmail.sender}
												</div>
												<div className="text-xs text-[#999]">
													To: You
												</div>
											</div>
										</div>
									</div>
									<div className="text-sm text-[#999]">
										{formatDistanceToNow(
											selectedEmail.time,
											{ addSuffix: true }
										)}
									</div>
								</div>
							</div>

							<div className="flex-1 p-6">
								<div className="prose prose-invert max-w-none">
									<div className="bg-[#1A1A1A] rounded-lg p-6 border border-[#2A2A2A]">
										<div className="text-center mb-6">
											<div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center mx-auto mb-4">
												<svg
													className="w-8 h-8 text-white"
													fill="currentColor"
													viewBox="0 0 24 24"
												>
													<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
												</svg>
											</div>
											<h2 className="text-2xl font-bold text-white mb-2">
												Inactive database notice
											</h2>
										</div>

										<div className="space-y-4 text-[#E0E0E0]">
											<p>Hi there,</p>
											<p>
												We've noticed that your free
												tier{" "}
												<strong>Database Zero</strong>,
												has been inactive recently.
											</p>
											<p>
												In our efforts to optimize our
												services, we will be deleting it
												soon. If you wish to keep your
												database, please keep it active
												by sending it traffic through
												your apps or upgrade to another
												plan. We will notify you one
												more time before deleting. You
												can always check your database
												status{" "}
												<Link
													href="#"
													className="text-blue-400 hover:text-blue-300"
												>
													here
												</Link>
												.
											</p>
											<p>
												Thank you for choosing Upstash.
												If you need assistance or have
												any questions, our support team
												is here to help at{" "}
												<Link
													href="#"
													className="text-blue-400 hover:text-blue-300"
												>
													support@upstash.com
												</Link>
											</p>
											<p>Best,</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
