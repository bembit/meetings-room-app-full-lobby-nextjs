"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { NavigationMenuDemo } from "@/components/navigation";
import { ModeToggle } from "@/components/ModeToggle";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

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

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
        <div className="p-6">
          <ModeToggle />
        </div>
      <div>
      <NavigationMenuDemo />
        <h1 className="text-4xl font-bold mb-4">Welcome</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

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
              // className="border border-gray-300 p-2 rounded w-full"
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
              // className="border border-gray-300 p-2 rounded w-full"
              className=""
              required
            />
          </div>
          <Button
            type="submit"
            // className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
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
      </div>
    </main>
  );
}