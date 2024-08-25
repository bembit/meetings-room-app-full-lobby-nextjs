"use client";
// general imports
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
// shadcn ui
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"



export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
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
    } catch (err) {
      console.error("Error during sign in:", err);
      setError("An unexpected error occurred. Please try again later.");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div>
        <h1 className="text-3xl font-bold mb-4">Login</h1>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded"
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded"
            required
          />
          {error && <p className="text-red-500">{error}</p>}
          <Button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Sign In
          </Button>
        </form>
      </div>
    </main>
  );
}