"use client";

import { getSession, signIn } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import Loading from "@/components/Loading";

import type { Session } from "next-auth";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if the user is logged in on component mount
  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      setSession(session);
      setLoading(false);
    };
    checkSession();
  }, []);

  const handleRegister = () => {
    router.push("/register"); 
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (!result?.error) {
      router.push("/profile");
      // router.push("/");
      // redirect("/");
    } else {
      setError(result.error);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
      <div className='w-full max-w-4xl shadow-md rounded-lg p-6 light:bg-gray-900 dark:bg-black'>
        <h1 className="text-4xl font-bold mb-4">Welcome</h1>
        <h2 className="text-3xl font-bold mb-4">Sign in</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {/* only render login form if no session */}
          {!session ? (
            <>
              <form onSubmit={handleLogin}>
                <div className="mb-4">
                  <Label htmlFor="email" className="block mb-2">
                    Email
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className=""
                    required
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="password" className="block mb-2">
                    Password
                  </Label>
                  <Input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className=""
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="hover:bg-orange-500 hover:text-white font-bold py-2 px-4 rounded"
                >
                  Login
                </Button>
              </form>

              {/* <p className="mt-4">
                Don&apos;t have an account?{" "}
                <Button
                  onClick={handleRegister}
                  className="hover:bg-transparent bg-transparent text-blue-500 font-bold underline"
                >
                  Register
                </Button>
              </p> */}
            </>
        ) : (
          <p>You are already logged in!</p>
        )}
      </div>
  );
}
