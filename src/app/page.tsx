"use client";

import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import Nav from "@/components/Nav";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import Loading from "@/components/Loading";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [session, setSession] = useState(null); // State to hold session data
  const [loading, setLoading] = useState(true); // State to show loading while session is being checked

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

  const handleLogin = async (e) => {
    e.preventDefault();

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (!result?.error) {
      router.push("/profile");
    } else {
      setError(result.error);
    }
  };

  if (loading) {
    return <Loading />; // You can customize this with a loading spinner
  }

  return (
    <main className="flex min-h-screen flex-col items-center">
      <Nav />
      <h1 className="text-4xl font-bold mb-4">Welcome</h1>
      <div>
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

            <p className="mt-4">
              Don't have an account?{" "}
              <Button
                onClick={handleRegister}
                className="hover:bg-transparent bg-transparent text-blue-500 font-bold underline"
              >
                Register
              </Button>
            </p>
          </>
        ) : (
          <p>You are already logged in!</p>
        )}
      </div>
    </main>
  );
}
