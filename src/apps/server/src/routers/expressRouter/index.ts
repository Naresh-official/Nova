import { enhanceEmailContent, generateEmailSubject } from "@nova/ai";
import { Router } from "express";
import { stdout } from "process";

const router: Router = Router();

router.get("/generate-subject", async (req, res) => {
	res.setHeader("Content-Type", "text/event-stream");
	res.setHeader("Cache-Control", "no-cache");
	res.setHeader("Connection", "keep-alive");
	res.flushHeaders();

	const emailBody = req.query.emailBody as string;
	const chunks = await generateEmailSubject(emailBody);

	for await (const chunk of chunks) {
		res.write(`data: ${JSON.stringify(chunk)}\n\n`);
	}
	res.write("event: done\ndata: Stream complete\n\n");
	res.end();
});

router.get("/enhance-email", async (req, res) => {
	res.setHeader("Content-Type", "text/event-stream");
	res.setHeader("Cache-Control", "no-cache");
	res.setHeader("Connection", "keep-alive");
	res.flushHeaders();

	const { emailBody, senderName, senderEmail, recipientEmail, subject } =
		req.query;
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
	res.end();
});

export default router;
