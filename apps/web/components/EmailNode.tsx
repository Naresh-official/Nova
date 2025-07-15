import React from "react";
import { Badge } from "@nova/ui/components/badge";
import { formatDate } from "date-fns";
import type { TRPCThreadResponse } from "@nova/server/types";
import { extractSenderName } from "@/lib/utils";

function EmailNode({
	email,
	selectedEmail,
	setSelectedEmail,
}: {
	email: TRPCThreadResponse;
	selectedEmail: TRPCThreadResponse | undefined;
	setSelectedEmail: (email: TRPCThreadResponse) => void;
}) {
	return (
		<div
			key={email.id}
			onClick={() => setSelectedEmail(email)}
			className={`p-4 my-2 cursor-pointer transition-all duration-300 hover:bg-[#111111] border-2 rounded-xl ${
				selectedEmail?.id === email.id
					? "bg-[#111111] border-primary"
					: "border-transparent"
			}`}
		>
			<div className="flex items-start gap-3">
				<div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
					{extractSenderName(email.sender)[0].toUpperCase()}
				</div>
				<div className="flex-1 min-w-0">
					<div className="flex items-center justify-between mb-1">
						<div className="text-sm flex items-center">
							<span
								className={`${email.isUnread ? "text-white font-extrabold" : "text-muted-foreground"}`}
							>
								{extractSenderName(email.sender)}
							</span>

							{/* {email.important && (
                  <Badge
                    variant="secondary"
                    className="text-xs ml-2 bg-orange-500/20 text-orange-400 border-orange-500/30"
                  >
                    Important
                  </Badge>
                )} */}
						</div>
						<span className="text-xs text-[#999]">
							{formatDate(email.date, "MMM dd, yyyy")}{" "}
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
