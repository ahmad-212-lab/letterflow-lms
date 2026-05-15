import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./firebase-admin";
import bcrypt from "bcryptjs";
import { logAction } from "./audit-logger";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@letterflow.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        if (!db) {
          console.error("Firestore not initialized");
          return null;
        }

        // For testing purposes, if no users exist, we create an admin on the fly
        const usersSnapshot = await db.collection('users').limit(1).get();
        if (usersSnapshot.empty && credentials.email === "admin@letterflow.com") {
           const hashedPassword = await bcrypt.hash(credentials.password, 10);
           const newUserRef = db.collection('users').doc();
           await newUserRef.set({
             name: "System Admin",
             email: credentials.email,
             password: hashedPassword,
             role: "Admin",
             status: "Active",
             createdAt: new Date().toISOString()
           });
           return { id: newUserRef.id, name: "System Admin", email: credentials.email };
        }

        const userQuery = await db.collection('users').where('email', '==', credentials.email).limit(1).get();

        if (userQuery.empty) {
          return null;
        }

        const userDoc = userQuery.docs[0];
        const user = userDoc.data();

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        await logAction(userDoc.id, user.name, 'LOGIN', `User logged in from ${credentials?.email}`);

        return {
          id: userDoc.id,
          name: user.name,
          email: user.email,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
      }
      if (trigger === "update" && session) {
        token.name = session.name;
        token.email = session.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
};
