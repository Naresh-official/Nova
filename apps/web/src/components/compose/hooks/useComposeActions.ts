import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { trpc } from "@/lib/client";
import { convertToBase64 } from "../utils/convertToBase64";

interface UseComposeActionsProps {
	draftId?: string | null;
	onClose: () => void;
	resetForm: () => void;
}

export function useComposeActions({
	draftId,
	onClose,
	resetForm,
}: UseComposeActionsProps) {
	const utils = trpc.useUtils();
	const { data: session } = useSession();

	const sendMessage = trpc.messages.sendMessage.useMutation();
	const saveDraft = trpc.drafts.saveDraft.useMutation({
		onSuccess: () => {
			utils.drafts.listDrafts.invalidate();
		},
		onError: () => {
			toast.error("Failed to save draft");
		},
	});
	const deleteDraft = trpc.drafts.deleteDraft.useMutation({
		onSuccess: () => {
			utils.drafts.listDrafts.invalidate();
			toast.success("Draft deleted!");
			onClose();
		},
		onError: () => {
			toast.error("Failed to delete draft");
		},
	});

	const handleSend = async (formData: {
		to: string[];
		cc: string[];
		bcc: string[];
		subject: string;
		body: string;
		attachments: File[];
	}) => {
		if (!formData.to.length) {
			toast.error("Please add at least one recipient");
			return;
		}

		try {
			const preparedAttachments = await Promise.all(
				formData.attachments.map(async (file) => ({
					filename: file.name,
					mimeType: file.type,
					data: await convertToBase64(file),
				}))
			);

			const toastId = toast.loading("Sending email...");
			await sendMessage.mutateAsync({
				senderName: session?.user?.name || "Nova User",
				...formData,
				attachments: preparedAttachments,
			});
			toast.dismiss(toastId);
			toast.success("Email sent!");

			if (draftId) {
				await deleteDraft.mutateAsync(draftId);
			}

			resetForm();
			onClose();
		} catch (err) {
			console.error(err);
			toast.error("Failed to send email");
		}
	};

	const handleSaveDraft = async (formData: {
		to: string[];
		cc: string[];
		bcc: string[];
		subject: string;
		body: string;
		attachments: File[];
		isEmpty: boolean;
	}) => {
		try {
			if (
				formData.isEmpty ||
				(formData.body.trim() === "" && !formData.attachments.length)
			) {
				onClose();
				return;
			}

			const preparedAttachments = await Promise.all(
				formData.attachments.map(async (file) => ({
					filename: file.name,
					mimeType: file.type,
					data: await convertToBase64(file),
				}))
			);

			const toastId = toast.loading("Saving draft...");
			await saveDraft.mutateAsync({
				senderName: session?.user?.name || "Nova User",
				...formData,
				attachments: preparedAttachments,
				draftId: draftId || undefined,
			});
			toast.dismiss(toastId);
			toast.success("Draft saved!");
			onClose();
		} catch (err) {
			console.error(err);
			toast.error("Failed to save draft");
		}
	};

	const handleDelete = async () => {
		if (draftId) {
			try {
				const toastId = toast.loading("Deleting draft...");
				await deleteDraft.mutateAsync(draftId);
				toast.dismiss(toastId);
			} catch (err) {
				console.error(err);
			}
		} else {
			resetForm();
			onClose();
		}
	};

	return {
		handleSend,
		handleSaveDraft,
		handleDelete,
		isLoading:
			sendMessage.isPending || saveDraft.isPending || deleteDraft.isPending,
	};
}
