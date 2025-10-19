export function parseCookies(cookieHeader?: string) {
	if (!cookieHeader) return {};
	return Object.fromEntries(
		cookieHeader
			.split(";")
			.map((cookie) => cookie.trim().split("="))
			.map(([key, ...v]) => [key, decodeURIComponent(v.join("="))])
	);
}
