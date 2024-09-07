import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import HoverCardDemo from "@/components/HoverCardDemo";
import Link from "next/link";

export default async function UsersPage() {
  const session = await getServerSession(authOptions);

  // If no session exists, redirect to login page
  if (!session) {
    redirect("/");
  }

  await dbConnect();

  const users = await User.find({}, "email").limit(10); // Fetch the encoded ID and email

  return (
    <div className='w-full max-w-4xl shadow-md rounded-lg p-6 light:bg-gray-900 dark:bg-black'>
      <h1 className="text-3xl font-bold mb-4">Registered Users</h1>
      <h2>Server side component test</h2>
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
    </div>
  );
}
