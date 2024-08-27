import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from 'next/navigation';
import DropdownMenuDemo from "@/components/DropdownMenuDemo";
import Nav from "@/components/Nav";

import type { Session } from "next-auth";

export default async function Profile() {
  const session = await getServerSession(authOptions) as Session | null;

  if (!session) {
    redirect("/");
  }

  const { email } = session.user;

  return (
    <main className="flex min-h-screen flex-col items-center">
      <Nav />
      <div>
        <DropdownMenuDemo email={email} />
        <h2 className="text-3xl font-bold mb-4">
          Welcome, {session?.user?.email}!
        </h2>
        <div className="flex flex-col items-center">
          <ul>
            <li>render statistics</li>
          </ul>
          <ul>
            <li>change details</li>
          </ul>
        </div>
      </div>
    </main>
  );
}