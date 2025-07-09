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
            "https://www.googleapis.com/auth/gmail.readonly",
            "https://www.googleapis.com/auth/gmail.send",
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
          let existingUser = null;
          try {
            const response = await axios.get(
              `${process.env.BACKEND_URL}/user.getUserByEmail?input="${email}"`,
            );
            existingUser = response.data;
          } catch (error) {
            if (
              axios.isAxiosError(error) &&
              error.response?.status === 404 &&
              error.response?.data.error.message === "User not found"
            ) {
              existingUser = null;
            } else {
              console.error("Error fetching user by email:", error);
              throw error;
            }
          }
          if (existingUser) {
            user.id = existingUser.id;
            user.email = existingUser.email;
            user.name = existingUser.name;
            return true;
          } else {
            try {
              const response = await axios.post(
                `${process.env.BACKEND_URL}/user.createUser`,
                {
                  name: user.name || "",
                  email: user.email || "",
                  image: user.image || "",
                  accessToken: account.access_token,
                  refreshToken: account.refresh_token,
                },
              );
              const newUser = response.data;
              user.id = newUser.id;
              user.email = newUser.email;
              user.name = newUser.name;
              return true;
            } catch (error) {
              console.error("Error creating user:", error);
              throw error;
            }
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
    maxAge: 2 * 24 * 60 * 60, // 2 days in seconds
  },
  pages: {
    signIn: "/login",
  },
};
