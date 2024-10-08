import NextAuth, { NextAuthOptions, type SessionStrategy } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcrypt";
// import { type JWT } from "next-auth/jwt";

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        await dbConnect(); 

        const user = await User.findOne({ email: credentials?.email });

        if (!user) {
          throw new Error("No user found!");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials?.password ?? "", // Provide a default value if undefined
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error("Incorrect credentials!");
        }

        return user; 
      },
    }),
  ],
  session: {
    strategy: "jwt" as SessionStrategy,
  },
  callbacks: {
    // async jwt({ token, user }: { token: JWT, user: typeof User }) {
    async jwt({ token, user }) {
      if (user?._id) token._id = user._id;
      if (user?.email) token.email = user.email;
      return token;
    },
    async session({ session, token }) {
      if (token?._id) session.user._id = token._id;
      if (token?.email) session.user.email = token.email;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST, authOptions };