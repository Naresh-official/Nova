import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "src/trpc";
import { z } from "zod";

export const messagesRouter = router({
	sendMessage: protectedProcedure
		.input(
			z.object({
				senderName: z.string().min(1),
				to: z.array(z.string().email()),
				subject: z.string().min(1),
				body: z.string().min(1),
				cc: z.array(z.string().email()).optional(),
				bcc: z.array(z.string().email()).optional(),
				attachments: z
					.array(
						z.object({
							filename: z.string(),
							mimeType: z.string(),
							data: z.string(),
						})
					)
					.optional(),
			})
		)
		.output(
			z.object({
				success: z.boolean(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { senderName, to, subject, body, cc, bcc, attachments } = input;

			try {
				await ctx.mailManager.emailComposer.sendEmail(
					senderName,
					to,
					subject,
					body,
					cc || [],
					bcc || [],
					attachments || []
				);

				return { success: true };
			} catch (error) {
				console.error("Failed to send email:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to send email",
				});
			}
		}),
});
