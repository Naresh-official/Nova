import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";

export const authOptions: NextAuthOptions = {
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
			httpOptions: {
				timeout: 30000,
			},
			authorization: {
				params: {
					scope: [
						"openid",
						"email",
						"profile",
						"https://www.googleapis.com/auth/gmail.modify",
						"https://www.googleapis.com/auth/gmail.readonly",
						"https://www.googleapis.com/auth/gmail.send",
						"https://www.googleapis.com/auth/gmail.labels",
						"https://www.googleapis.com/auth/gmail.compose",
					].join(" "),
					access_type: "offline",
					prompt: "consent",
				},
			},
		}),
	],
	callbacks: {
		async signIn({ user, account }) {
			try {
				if (account?.provider === "google") {
					const email = user.email;
					if (!email) {
						throw new Error("Email not found");
					}
					const response = await axios.post(
						`${process.env.BACKEND_URL}/user.login`,
						{
							email: user.email,
							name: user.name,
							image: user.image,
							accessToken: account.access_token,
							refreshToken: account.refresh_token,
						}
					);

					try {
						const loggedInuser = response.data.result.data;
						user.id = loggedInuser.id;
						user.name = loggedInuser.name;
						user.image = loggedInuser.image;
						user.email = loggedInuser.email;
						return true;
					} catch (error) {
						console.error("Error fetching user by email:", error);
						return false;
					}
				}
				return false;
			} catch (error) {
				console.error("Error in signIn callback:", error);
				return false;
			}
		},
		async jwt({ token, user, account }) {
			if (user && account) {
				token.email = user.email;
				token.name = user.name;
				token.picture = user.image;
			}

			return token;
		},
		async session({ session, token }) {
			if (session.user && token) {
				session.user.email = token.email as string;
				session.user.name = token.name as string;
				session.user.image = token.picture as string;
			}
			return session;
		},
	},
	secret: process.env.NEXTAUTH_SECRET,
	session: {
		strategy: "jwt",
		maxAge: 4 * 24 * 60 * 60, // 4 days in seconds
	},
	pages: {
		signIn: "/login",
	},
};
