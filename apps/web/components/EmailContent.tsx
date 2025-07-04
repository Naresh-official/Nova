import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import React from "react";

interface Email {
	id: string;
	sender: string;
	subject: string;
	preview: string;
	time: Date;
	unread: boolean;
	important?: boolean;
	avatar: string;
}

interface EmailContentProps {
	selectedEmail: Email | undefined;
}

function EmailContent({ selectedEmail }: EmailContentProps) {
	return (
		<div className="flex-1 flex flex-col bg-black rounded-lg scroll-container h-[calc(100vh-18px)]">
			{selectedEmail && (
				<div className="flex-1 animate-fade-in">
					<div className="p-6 border-b border-[#2A2A2A]">
						<div className="flex items-start justify-between mb-4">
							<div>
								<h1 className="text-xl font-semibold text-white mb-2">
									{selectedEmail?.subject}
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
								{formatDistanceToNow(selectedEmail.time, {
									addSuffix: true,
								})}
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
										We've noticed that your free tier{" "}
										<strong>Database Zero</strong>, has been
										inactive recently.
									</p>
									<p>
										In our efforts to optimize our services,
										we will be deleting it soon. If you wish
										to keep your database, please keep it
										active by sending it traffic through
										your apps or upgrade to another plan. We
										will notify you one more time before
										deleting. You can always check your
										database status{" "}
										<Link
											href="#"
											className="text-blue-400 hover:text-blue-300"
										>
											here
										</Link>
										.
									</p>
									<p>
										Thank you for choosing Upstash. If you
										need assistance or have any questions,
										our support team is here to help at{" "}
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
	);
}

export default EmailContent;
