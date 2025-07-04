import React from "react";
import { Email } from "./EmailList";
import { Badge } from "@nova/ui/components/badge";
import { formatDate } from "date-fns";

function EmailNode({
	email,
	selectedEmail,
	setSelectedEmail,
}: {
	email: Email;
	selectedEmail: Email | undefined;
	setSelectedEmail: (email: Email) => void;
}) {
	return (
		<div
			key={email.id}
			onClick={() => setSelectedEmail(email)}
			className={`p-4 my-2 cursor-pointer transition-all duration-300 hover:bg-[#111111] border-l-2 rounded-xl ${
				selectedEmail?.id === email.id
					? "bg-[#111111] border-l-primary"
					: "border-l-transparent"
			}`}
		>
			<div className="flex items-start gap-3">
				<div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
					{email.avatar}
				</div>
				<div className="flex-1 min-w-0">
					<div className="flex items-center justify-between mb-1">
						<div className="text-sm flex items-center">
							<span
								className={`${email.unread ? "text-white font-extrabold" : "text-muted-foreground"}`}
							>
								{email.sender}
							</span>

							{email.important && (
								<Badge
									variant="secondary"
									className="text-xs ml-2 bg-orange-500/20 text-orange-400 border-orange-500/30"
								>
									Important
								</Badge>
							)}
						</div>
						<span className="text-xs text-[#999]">
							{formatDate(email.time, "MMM dd, yyyy")}{" "}
						</span>
					</div>
					<h3 className="text-sm mb-1 line-clamp-1 text-muted-foreground">
						{email.subject}
					</h3>
				</div>
			</div>
		</div>
	);
}

export default EmailNode;
