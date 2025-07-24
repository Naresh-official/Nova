import React, { useState } from "react";
import { NovaHeader } from "./Header";
import EmailNode from "./EmailNode";
import type { ThreadResponse } from "@nova/server/types";

interface EmailListProps {
	emails: ThreadResponse[];
	selectedEmail: ThreadResponse | undefined;
	setSelectedEmail: (email: ThreadResponse) => void;
}

function EmailList({
	emails,
	selectedEmail,
	setSelectedEmail,
}: EmailListProps) {
	return (
		<div className="w-[420px] bg-black rounded-lg">
			<NovaHeader />
			<div className="scroll-container h-[calc(100vh-80px)] px-2">
				{emails.map((email) => (
					<EmailNode
						key={email.id}
						email={email}
						selectedEmail={selectedEmail}
						setSelectedEmail={setSelectedEmail}
					/>
				))}
			</div>
		</div>
	);
}

export default EmailList;
