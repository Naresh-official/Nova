import React, { useState } from "react";
import { NovaHeader } from "./Header";
import EmailNode from "./EmailNode";
import type { TRPCThreadResponse } from "@nova/server/types";

interface EmailListProps {
	emails: TRPCThreadResponse[];
	selectedEmail: TRPCThreadResponse | undefined;
	setSelectedEmail: (email: TRPCThreadResponse) => void;
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
