import EmailContent from "@/components/email/content/components/EmailContent";
import EmailList from "@/components/email/list/EmailList";

export default function InboxPage() {
	return (
		<div className="h-screen p-2 w-full">
			<div className="flex gap-2">
				{/* Email List */}
				<EmailList />
				{/* Email Content */}
				<EmailContent />
			</div>
		</div>
	);
}
