import React, { useState } from "react";
import { NovaHeader } from "./Header";
import EmailNode from "./EmailNode";

export interface Email {
	id: string;
	sender: string;
	subject: string;
	preview: string;
	time: Date;
	unread: boolean;
	important?: boolean;
	avatar: string;
}

interface EmailListProps {
	emails: Email[];
	selectedEmail: Email | undefined;
	setSelectedEmail: (email: Email) => void;
}

function EmailList({
	emails,
	selectedEmail,
	setSelectedEmail,
}: EmailListProps) {
	return (
		<div className="w-[420px] bg-[#101010] rounded-lg">
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
