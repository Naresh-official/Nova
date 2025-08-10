import { type gmail_v1 } from "@googleapis/gmail";
import { GmailClient } from "../core/gmailClient";
import { mapToGoogleLabelColor } from "../utils/google-label-color-map";

export class LabelService {
	constructor(private client: GmailClient) {}

	async getLabels(): Promise<gmail_v1.Schema$Label[]> {
		const res = await this.client.gmail.users.labels.list({
			userId: "me",
		});

		const access_token = await this.client.getAccessToken();

		if (!res?.data?.labels) return [];

		const labels = await Promise.all(
			res.data.labels.map(async (label) => {
				const details = await this.client.gmail.users.labels.get({
					userId: "me",
					id: label.id || "",
					access_token,
				});
				return details.data;
			})
		);

		return labels;
	}

	async createLabel(label: {
		name: string;
		color?: { backgroundColor: string; textColor: string };
	}) {
		await this.client.gmail.users.labels.create({
			userId: "me",
			requestBody: {
				name: label.name,
				labelListVisibility: "labelShow",
				messageListVisibility: "show",
				color: label.color
					? mapToGoogleLabelColor({
							backgroundColor: label.color.backgroundColor,
							textColor: label.color.textColor,
						})
					: undefined,
			},
		});
	}
	async updateLabel(id: string, label: gmail_v1.Schema$Label) {
		await this.client.gmail.users.labels.update({
			userId: "me",
			id: id,
			requestBody: {
				name: label.name,
				color: label.color
					? mapToGoogleLabelColor({
							backgroundColor: label.color.backgroundColor || "",
							textColor: label.color.textColor || "",
						})
					: undefined,
			},
		});
	}
	async deleteLabel(id: string) {
		await this.client.gmail.users.labels.delete({
			userId: "me",
			id: id,
		});
	}
}
