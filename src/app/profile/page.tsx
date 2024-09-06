"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
// import DropdownMenuDemo from "@/components/DropdownMenuDemo";
import Nav from "@/components/Nav";
import Loading from "@/components/Loading";

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") {
      setLoading(true);
    } else if (status === "authenticated") {
      setLoading(false);
    } else if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (loading) {
    return (
      <Loading />
    );
  }

  if (!session) {
    return null;
    // redirect("/");
  }

  const { email } = session.user;

  return (
      <div className='w-full max-w-4xl shadow-md rounded-lg p-6 light:bg-gray-900 dark:bg-black'>
        {/* <DropdownMenuDemo email={email} /> */}
        <h2 className="text-3xl font-bold mb-4">
          Welcome, {email}!
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
  );
}
