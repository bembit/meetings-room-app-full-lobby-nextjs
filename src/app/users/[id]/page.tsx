// app/users/[id]/page.tsx

import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Nav from "@/components/Nav";

interface UserProfileProps {
  params: { id: string };
}

export default async function UserProfile({ params }: UserProfileProps) {
    await dbConnect();
  
    const session = await getServerSession(authOptions);
    const user = await User.findById(params.id);

    // If no session exists, redirect to login page
    if (!session) {
        redirect("/");
    }

    if (!user) {
        return redirect("/users");
    }

    return (
        <div className='w-full max-w-4xl shadow-md rounded-lg p-6 light:bg-gray-900 dark:bg-black'>
            <h1 className="text-3xl font-bold mb-4">User Profile</h1>
            <p>Email: {user.email}</p>
            {/* user profiles for testing fun */}
        </div>
    );
}
