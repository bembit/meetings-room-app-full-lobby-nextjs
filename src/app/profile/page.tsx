import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from 'next/navigation';
import SignOutButton from "@/components/SignOutButton";
import DropdownMenuDemo from "@/components/DropdownMenuDemo";

export default async function Profile() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div>
        <DropdownMenuDemo session={session} /> {/* Use the DropdownMenuDemo component */}
        <h1 className="text-3xl font-bold mb-4">
          Welcome, {session?.user?.email}!
        </h1>
        {/* <SignOutButton /> Use the SignOutButton component */}
      </div>
    </main>
  );
}