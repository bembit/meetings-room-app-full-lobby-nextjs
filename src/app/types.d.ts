// src/types.d.ts
import { DefaultSession, DefaultJWT } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      // _id?: string;
      name?: string | null;
      email: string;
      // ... any other properties you added to the user object
    } & DefaultSession["user"];
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile`
   * callback, or the second parameter of the `session` callback, or the
   * first parameter of the `jwt` callback.
   */
  interface User {
    _id?: string; // Make _id optional as it might not be available initially
    // ... any other properties you added to the user object
  }

  /**
   * Usually contains information about the provider being used
   * and also extends `TokenSet`, which is different tokens returned by OAuth Providers.
   */
  interface JWT {
    _id?: string; // Make _id optional here as well
    email?: string; // Make email optional if it's not always present in the JWT
    // ... any other properties you added to the JWT
  }
}