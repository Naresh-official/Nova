import { SchemaLabel } from "src/schemas";
import { protectedProcedure, router } from "src/trpc";
import { z } from "zod";

export const labelsRouter = router({
	getLabels: protectedProcedure
		.output(
			z.object({
				core: z.array(SchemaLabel),
				management: z.array(SchemaLabel),
				customLabels: z.array(SchemaLabel),
			})
		)
		.query(async ({ ctx }) => {
			const labels = await ctx.mailManager.labels.getLabels();

			const core = labels.filter(
				(label) =>
					label.name === "INBOX" ||
					label.name === "SENT" ||
					label.name === "DRAFT"
			);

			const management = labels.filter(
				(label) =>
					label.name === "TRASH" ||
					label.name === "SPAM" ||
					label.name === "ARCHIVE"
			);

			const customLabels = labels.filter((label) => label.type === "user");

			return { core, management, customLabels };
		}),

	createLabel: protectedProcedure
		.input(
			z.object({
				name: z.string(),
				color: z
					.object({
						backgroundColor: z.string(),
						textColor: z.string(),
					})
					.default({
						backgroundColor: "",
						textColor: "",
					}),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { name, color } = input;

			await ctx.mailManager.labels.createLabel({
				name: name.trim(),
				color: {
					backgroundColor: color.backgroundColor?.trim(),
					textColor: color.textColor?.trim(),
				},
			});
		}),

	deleteLabel: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx, input }) => {
			await ctx.mailManager.labels.deleteLabel(input);
		}),
});
