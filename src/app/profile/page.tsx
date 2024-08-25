'use client';

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Profile() {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session) {
    router.push("/login");
    return null;
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' }); 
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div>
        <h1 className="text-3xl font-bold mb-4">
          Welcome, {session?.user?.email}!
        </h1>
        <button
          onClick={handleSignOut}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Sign Out
        </button>
      </div>
    </main>
  );
}