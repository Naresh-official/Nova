export interface Email {
	id: string;
	threadId: string;
	from: {
		name: string;
		email: string;
		avatar?: string;
	};
	to: {
		name: string;
		email: string;
	}[];
	subject: string;
	body: string;
	timestamp: Date;
	read: boolean;
	starred: boolean;
	important: boolean;
	category: "primary" | "social" | "promotions" | "updates";
	labels: string[];
	attachments?: {
		name: string;
		size: string;
		type: string;
	}[];
	aiSummary?: string;
	aiPriority: "high" | "medium" | "low";
}

export interface Draft {
	id: string;
	to: string;
	subject: string;
	body: string;
	timestamp: Date;
	aiSuggestions?: string[];
}

export interface Contact {
	id: string;
	name: string;
	email: string;
	avatar?: string;
	company?: string;
	lastContact?: Date;
	frequency: number;
}

export interface Template {
	id: string;
	name: string;
	subject: string;
	body: string;
	category: string;
	aiGenerated: boolean;
}

export const mockEmails: Email[] = [
	{
		id: "1",
		threadId: "thread-1",
		from: {
			name: "Sarah Johnson",
			email: "sarah@techcorp.com",
			avatar: "/placeholder.svg?height=40&width=40",
		},
		to: [{ name: "You", email: "you@example.com" }],
		subject: "Q4 Marketing Strategy Review",
		body: "Hi there! I wanted to follow up on our discussion about the Q4 marketing strategy. The team has prepared a comprehensive analysis of our current campaigns and proposed improvements for the upcoming quarter. Could we schedule a meeting this week to go over the details? I think you'll find the ROI projections particularly interesting.",
		timestamp: new Date("2024-01-15T10:30:00"),
		read: false,
		starred: true,
		important: true,
		category: "primary",
		labels: ["work", "marketing"],
		aiSummary:
			"Sarah wants to schedule a meeting to discuss Q4 marketing strategy and ROI projections.",
		aiPriority: "high",
	},
	{
		id: "2",
		threadId: "thread-2",
		from: {
			name: "GitHub",
			email: "noreply@github.com",
		},
		to: [{ name: "You", email: "you@example.com" }],
		subject: "Your weekly digest - 5 new notifications",
		body: "Here's what happened in your repositories this week: 3 new pull requests, 2 issues closed, and 1 new release. Check out the latest activity on your projects.",
		timestamp: new Date("2024-01-15T09:15:00"),
		read: false,
		starred: false,
		important: false,
		category: "updates",
		labels: ["github", "development"],
		aiSummary:
			"Weekly GitHub digest with 5 notifications about repository activity.",
		aiPriority: "medium",
	},
	{
		id: "3",
		threadId: "thread-3",
		from: {
			name: "LinkedIn",
			email: "messages-noreply@linkedin.com",
		},
		to: [{ name: "You", email: "you@example.com" }],
		subject: "You have 3 new connection requests",
		body: "People are interested in connecting with you! You have 3 new connection requests waiting for your response.",
		timestamp: new Date("2024-01-15T08:45:00"),
		read: true,
		starred: false,
		important: false,
		category: "social",
		labels: ["linkedin", "networking"],
		aiSummary: "3 new LinkedIn connection requests pending.",
		aiPriority: "low",
	},
	{
		id: "4",
		threadId: "thread-4",
		from: {
			name: "Amazon",
			email: "auto-confirm@amazon.com",
		},
		to: [{ name: "You", email: "you@example.com" }],
		subject: "Your order has been shipped",
		body: "Great news! Your order #123-4567890 has been shipped and is on its way. Track your package using the link below.",
		timestamp: new Date("2024-01-14T16:20:00"),
		read: true,
		starred: false,
		important: false,
		category: "promotions",
		labels: ["shopping", "amazon"],
		attachments: [
			{ name: "shipping-label.pdf", size: "245 KB", type: "pdf" },
		],
		aiSummary: "Amazon order shipped with tracking information.",
		aiPriority: "medium",
	},
	{
		id: "5",
		threadId: "thread-5",
		from: {
			name: "Mike Chen",
			email: "mike@designstudio.com",
		},
		to: [{ name: "You", email: "you@example.com" }],
		subject: "Design mockups for review",
		body: "Hey! I've finished the initial mockups for the new website design. Please take a look and let me know your thoughts. I've attached the files for your review.",
		timestamp: new Date("2024-01-14T14:10:00"),
		read: false,
		starred: true,
		important: true,
		category: "primary",
		labels: ["design", "review"],
		attachments: [
			{ name: "homepage-mockup.png", size: "2.1 MB", type: "image" },
			{ name: "mobile-design.png", size: "1.8 MB", type: "image" },
		],
		aiSummary:
			"Mike sent website design mockups for review with attached files.",
		aiPriority: "high",
	},
];

export const mockDrafts: Draft[] = [
	{
		id: "draft-1",
		to: "sarah@techcorp.com",
		subject: "Re: Q4 Marketing Strategy Review",
		body: "Hi Sarah,\n\nThanks for reaching out about the Q4 strategy review. I'm available for a meeting this Thursday or Friday afternoon. The ROI projections sound very promising!\n\nBest regards,",
		timestamp: new Date("2024-01-15T11:00:00"),
		aiSuggestions: [
			"Consider mentioning specific time slots for the meeting",
			"Ask about the agenda items to prepare better",
			"Suggest a video call for better collaboration",
		],
	},
	{
		id: "draft-2",
		to: "team@company.com",
		subject: "Weekly Team Update",
		body: "Hi everyone,\n\nHere's our weekly update:\n\n- Project Alpha is 80% complete\n- New client onboarding went smoothly\n- Next week we'll focus on...",
		timestamp: new Date("2024-01-15T09:30:00"),
		aiSuggestions: [
			"Add specific metrics and numbers",
			"Include action items for next week",
			"Mention any blockers or challenges",
		],
	},
];

export const mockContacts: Contact[] = [
	{
		id: "contact-1",
		name: "Sarah Johnson",
		email: "sarah@techcorp.com",
		avatar: "/placeholder.svg?height=40&width=40",
		company: "TechCorp Inc.",
		lastContact: new Date("2024-01-15T10:30:00"),
		frequency: 15,
	},
	{
		id: "contact-2",
		name: "Mike Chen",
		email: "mike@designstudio.com",
		company: "Design Studio",
		lastContact: new Date("2024-01-14T14:10:00"),
		frequency: 8,
	},
	{
		id: "contact-3",
		name: "Emily Rodriguez",
		email: "emily@startup.io",
		company: "Startup.io",
		lastContact: new Date("2024-01-10T16:45:00"),
		frequency: 12,
	},
];

export const mockTemplates: Template[] = [
	{
		id: "template-1",
		name: "Meeting Request",
		subject: "Meeting Request: [Topic]",
		body: "Hi [Name],\n\nI hope this email finds you well. I would like to schedule a meeting to discuss [topic]. Would you be available for a [duration] meeting sometime next week?\n\nPlease let me know your availability.\n\nBest regards,\n[Your Name]",
		category: "Business",
		aiGenerated: true,
	},
	{
		id: "template-2",
		name: "Follow-up",
		subject: "Following up on our conversation",
		body: "Hi [Name],\n\nI wanted to follow up on our recent conversation about [topic]. As discussed, I'm attaching [documents/information] for your review.\n\nPlease let me know if you have any questions or need additional information.\n\nBest regards,\n[Your Name]",
		category: "Business",
		aiGenerated: true,
	},
	{
		id: "template-3",
		name: "Thank You",
		subject: "Thank you for [occasion]",
		body: "Dear [Name],\n\nThank you so much for [specific reason]. Your [help/support/time] was greatly appreciated and made a significant difference.\n\nI look forward to [future interaction/collaboration].\n\nWarm regards,\n[Your Name]",
		category: "Personal",
		aiGenerated: false,
	},
];
