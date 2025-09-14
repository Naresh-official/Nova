import dotenv from "dotenv";
import { prisma } from "./context";
import app from "./app";

dotenv.config();

try {
	prisma
		.$connect()
		.then(() => console.log("Connected to DB"))
		.catch((e: unknown) => {
			console.error("DB Connection failed", e);
		});

	app.listen(8000, () => {
		console.log("Server is running on http://localhost:8000");
	});
} catch (error: unknown) {
	console.error("Error starting server:", error);
	process.exit(1);
}
