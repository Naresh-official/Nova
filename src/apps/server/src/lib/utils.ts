export async function verifyToken(token: string) {
	const response = await fetch(
		`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
	);

	if (!response.ok) {
		throw new Error(`Failed to verify token: ${await response.text()}`);
	}

	const data = (await response.json()) as any;
	return !!data;
}
