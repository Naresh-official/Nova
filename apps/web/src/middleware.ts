import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_ROUTES = ["/login", "/"];
const PROTECTED_ROUTE_PREFIXES = ["/mail/"];

export async function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl;

	const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

	// Redirect logged-in users away from /login
	if (token && pathname === "/login") {
		const url = req.nextUrl.clone();
		url.pathname = "/";
		return NextResponse.redirect(url);
	}

	// Allow public routes if not logged in
	if (!token && PUBLIC_ROUTES.includes(pathname)) {
		return NextResponse.next();
	}

	// Check if route is protected
	const isProtected = PROTECTED_ROUTE_PREFIXES.some((prefix) =>
		pathname.startsWith(prefix)
	);

	// Redirect to login if trying to access protected routes without token
	if (!token && isProtected) {
		const url = req.nextUrl.clone();
		url.pathname = "/login";
		url.searchParams.set("redirectUrl", pathname);
		return NextResponse.redirect(url);
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/((?!_next/static|_next/image|_next/data|favicon.ico|service-worker.js|api).*)",
	],
};
