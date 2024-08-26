// components/SignOutButton.tsx
'use client';

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const data = await signOut({
      redirect: false, 
      callbackUrl: '/'
    })

    if (data?.error) {
      console.error('Error signing out:', data.error);
      // You might want to display an error message to the user here
    } else {
      router.push('/');
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
    >
      Sign Out
    </button>
  );
}