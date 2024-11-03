import { DrizzleAdapter } from "@auth/drizzle-adapter";
import {
  AuthOptions,
  DefaultSession,
  getServerSession as nextAuthGetServerSession,
} from "next-auth";
import GitlabProvider from "next-auth/providers/gitlab";
import { db } from "@/server/db/db";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

export const authOptions: AuthOptions = {
  adapter: DrizzleAdapter(db),
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
      }
      return session;
    },
  },

  // Configure one or more authentication providers
  providers: [
    GitlabProvider({
      clientId:
        "fda2cf167bd06925e09c444095c4a5728a71f56869f6db75fc39c68c9878c41c",
      clientSecret:
        "gloas-a4e2c544cefa4915f7b1860d198ffcc5f1a02a28eb4e50bcb94bb1f7da44aaad",
    }),
  ],
};
export function getServerSession() {
  return nextAuthGetServerSession(authOptions);
}
