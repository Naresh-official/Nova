import {
	enhanceEmailContent,
	generateEmailSubject,
	summarizeEmail,
} from "@nova/ai";
import { Router } from "express";
import { stdout } from "process";

const router: Router = Router();

router.post("/generate-subject", async (req, res) => {
	try {
		res.setHeader("Content-Type", "text/event-stream");
		res.setHeader("Cache-Control", "no-cache");
		res.setHeader("Connection", "keep-alive");
		res.flushHeaders();

		const emailBody = req.body.emailBody as string;
		const chunks = await generateEmailSubject(emailBody);

		for await (const chunk of chunks) {
			res.write(`data: ${JSON.stringify(chunk)}\n\n`);
		}
		res.write("event: done\ndata: Stream complete\n\n");
	} catch (error) {
		console.error("Error generating subject:", error);
		if (error instanceof Error)
			res.write(`event: error\ndata: ${error.message}\n\n`);
	} finally {
		res.end();
	}
});

router.post("/enhance-email", async (req, res) => {
	try {
		res.setHeader("Content-Type", "text/event-stream");
		res.setHeader("Cache-Control", "no-cache");
		res.setHeader("Connection", "keep-alive");
		res.flushHeaders();

		const { emailBody, senderName, senderEmail, recipientEmail, subject } =
			req.body;
		const params = {
			emailBody: emailBody as string,
			senderName: senderName as string,
			senderEmail: senderEmail as string,
			recipientEmail: recipientEmail as string | undefined,
			subject: subject as string | undefined,
		};

		const chunks = await enhanceEmailContent(params);

		for await (const chunk of chunks) {
			res.write(`data: ${JSON.stringify(chunk)}\n\n`);
		}
		res.write("event: done\ndata: Stream complete\n\n");
	} catch (error) {
		console.error("Error enhancing email:", error);
		if (error instanceof Error)
			res.write(`event: error\ndata: ${error.message}\n\n`);
	} finally {
		res.end();
	}
});

router.post("/summarize-email", async (req, res) => {
	try {
		res.setHeader("Content-Type", "text/event-stream");
		res.setHeader("Cache-Control", "no-cache");
		res.setHeader("Connection", "keep-alive");
		res.flushHeaders();

		const { sender, recipientEmail, subject, dateTime, emailBody } = req.body;
		const params = {
			sender: sender as string | undefined,
			recipientEmail: recipientEmail as string | undefined,
			subject: subject as string | undefined,
			dateTime: dateTime as string | undefined,
			emailBody: emailBody as string,
		};

		const chunks = await summarizeEmail(params);

		for await (const chunk of chunks) {
			res.write(`data: ${JSON.stringify(chunk)}\n\n`);
		}

		res.write("event: done\ndata: Stream complete\n\n");
	} catch (error) {
		console.error("Error summarizing email:", error);
		if (error instanceof Error)
			res.write(`event: error\ndata: ${error.message}\n\n`);
	} finally {
		res.end();
	}
});

export default router;
