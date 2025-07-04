"use client";

import { useState } from "react";
import Link from "next/link";
import { NovaHeader } from "@/components/Header";
import { Badge } from "@nova/ui/components/badge";
import { formatDistanceToNow } from "date-fns";
import EmailList from "@/components/EmailList";
import EmailContent from "@/components/EmailContent";

const emails = [
	{
		id: "1",
		sender: "Upstash",
		subject:
			"Action Required: Upstash Redis Database Inactivity First Notice",
		preview:
			"Hi there, We've noticed that your free tier Database Zero, has been inactive recently.",
		time: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
		unread: true,
		important: true,
		avatar: "U",
	},
	{
		id: "2",
		sender: "Nizzy",
		subject: "Search your inbox like you talk",
		preview: "Search your inbox like you talk 🧠🔍",
		time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
		unread: true,
		avatar: "N",
	},
	{
		id: "3",
		sender: "Framer",
		subject: "Welcome to Framer! (1 of 4)",
		preview: "Welcome to Framer! (1 of 4)",
		time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
		unread: false,
		avatar: "F",
	},
	{
		id: "4",
		sender: "Google Gemini",
		subject: "Naresh, it's been a while. Check out what's new...",
		preview: "Naresh, it's been a while. Check out what's new...",
		time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
		unread: false,
		avatar: "G",
	},
	{
		id: "5",
		sender: "Codebasics",
		subject: "Want to Gain Real-World Experience? Join the...",
		preview: "Want to Gain Real-World Experience? Join the...",
		time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
		unread: false,
		avatar: "C",
	},
	{
		id: "6",
		sender: "GitHub",
		subject: "Security alert: New sign-in to your account",
		preview:
			"We noticed a new sign-in to your GitHub account from a new device.",
		time: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
		unread: true,
		avatar: "G",
	},
	{
		id: "7",
		sender: "Stripe",
		subject: "Your June invoice is ready",
		preview:
			"Your monthly invoice for June is now available. View your invoice.",
		time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
		unread: false,
		avatar: "S",
	},
	{
		id: "8",
		sender: "Notion",
		subject: "Welcome to Notion!",
		preview: "Get started with your new Notion workspace.",
		time: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
		unread: false,
		avatar: "N",
	},
	{
		id: "9",
		sender: "Vercel",
		subject: "Your deployment was successful",
		preview: "Congratulations! Your project has been deployed.",
		time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
		unread: false,
		avatar: "V",
	},
	{
		id: "10",
		sender: "Figma",
		subject: "You’ve been invited to a new team",
		preview: "Join your teammates and start collaborating in Figma.",
		time: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
		unread: true,
		avatar: "F",
	},
	{
		id: "11",
		sender: "Slack",
		subject: "You have unread messages",
		preview: "Catch up on your conversations in Slack.",
		time: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
		unread: false,
		avatar: "S",
	},
	{
		id: "12",
		sender: "Twitter",
		subject: "New login to your account",
		preview:
			"We detected a login to your Twitter account from a new device.",
		time: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
		unread: true,
		avatar: "T",
	},
	{
		id: "13",
		sender: "LinkedIn",
		subject: "5 new jobs that match your profile",
		preview: "Check out these new job opportunities tailored for you.",
		time: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
		unread: false,
		avatar: "L",
	},
	{
		id: "14",
		sender: "Amazon Web Services",
		subject: "Your AWS Free Tier usage alert",
		preview: "You have used 85% of your AWS Free Tier limit.",
		time: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
		unread: true,
		avatar: "A",
	},
	{
		id: "15",
		sender: "Product Hunt",
		subject: "Top products for today",
		preview: "Discover the most upvoted products on Product Hunt.",
		time: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000),
		unread: false,
		avatar: "P",
	},
];

export default function InboxPage() {
	const [selectedEmail, setSelectedEmail] = useState(emails[0]);

	return (
		<div className="flex h-screen bg-black p-2 w-full">
			<div className="flex-1 flex gap-2">
				{/* Email List */}

				<EmailList
					emails={emails}
					selectedEmail={selectedEmail}
					setSelectedEmail={setSelectedEmail}
				/>
				{/* Email Content */}
				<EmailContent selectedEmail={selectedEmail} />
			</div>
		</div>
	);
}
