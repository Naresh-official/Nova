import EmailList from "@/components/list/EmailList";
import EmailContent from "@/components/email/content/components/EmailContent";

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
