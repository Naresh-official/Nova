import React, { useState } from "react";
import { NovaHeader } from "./NovaHeader";
import EmailNode from "./EmailNode";
import type { ThreadResponse } from "@nova/server/types";
import { LoaderCircle } from "lucide-react";

interface EmailListProps {
	emails: ThreadResponse[];
	selectedEmail: ThreadResponse | undefined;
	setSelectedEmail: (email: ThreadResponse) => void;
	lastEmailRef?: (node: HTMLDivElement | null) => void;
	isFetchingNextPage: boolean;
}

function EmailList({
	emails,
	selectedEmail,
	setSelectedEmail,
	lastEmailRef,
	isFetchingNextPage,
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
						ref={
							lastEmailRef && email.id === emails[emails.length - 3].id
								? lastEmailRef
								: undefined
						}
					/>
				))}
				{isFetchingNextPage && (
					<div className="flex justify-center items-center h-16">
						<LoaderCircle className="animate-spin" />
					</div>
				)}
			</div>
		</div>
	);
}

export default EmailList;
