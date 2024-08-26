import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from 'next/navigation';
import SignOutButton from "@/components/SignOutButton";
import DropdownMenuDemo from "@/components/DropdownMenuDemo";
import Nav from "@/components/Nav";

export default async function Profile() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen flex-col items-center">
      <Nav />
      <div>
        <h2 className="text-3xl font-bold mb-4">
          Dashboard
        </h2>
        <div className="flex flex-col items-center">
          <ul>
            <li>options</li>
            <li>what can the user do</li>
          </ul>
        </div>
      </div>
    </main>
  );
}