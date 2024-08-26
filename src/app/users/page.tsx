import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Nav from "@/components/Nav";
import HoverCardDemo from "@/components/HoverCardDemo";
import Link from "next/link";

export default async function UsersPage() {
  const session = await getServerSession(authOptions);

  // If no session exists, redirect to login page
  if (!session) {
    redirect("/");
  }

  await connectDB();

  const users = await User.find({}, "email encodedId").limit(10); // Fetch the encoded ID and email

  return (
    <main className="flex min-h-screen flex-col items-center">
      <Nav />
      <h1 className="text-3xl font-bold mb-4">Registered Users</h1>
      <ul>
        {users.map((user) => (
          <li key={user._id} className="p-4 border border-gray-200 mb-2 rou">
            <Link href={`/users/${user._id}`} passHref legacyBehavior>
              <a>
                {/* this will be hover only query for a short profile */}
                <HoverCardDemo email={user.email} />
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
