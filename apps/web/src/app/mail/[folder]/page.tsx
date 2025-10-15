import EmailContent from "@/components/email/content/components/EmailContent";
import EmailList from "@/components/email/list/components/EmailList";

export default function InboxPage() {
	return (
		<div className="h-screen p-0 sm:p-2 w-screen md:w-full">
			<div className="flex gap-2">
				{/* Email List */}
				<EmailList />
				{/* Email Content */}
				<EmailContent />
			</div>
		</div>
	);
}
