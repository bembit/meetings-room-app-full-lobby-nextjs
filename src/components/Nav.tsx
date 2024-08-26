"use client";

import { NavigationMenuDemo } from "@/components/navigation";
import { ModeToggle } from "@/components/ModeToggle";
import SignOutButton from "./SignOutButton";
import { useSession } from "next-auth/react"; // Import useSession hook
// import { DropdownMenuDemo } from "@/components/DropdownMenuDemo";

export default function Nav() {

    const { data: session } = useSession();

    return (
        <div className="flex flex-row justify-between items-center border-b border-gray-300 p-6 mb-6">
            <NavigationMenuDemo />
            {/* <DropdownMenuDemo email={email} /> Use the DropdownMenuDemo component */}
            {session && (
                <SignOutButton />
            )}
            <ModeToggle />
        </div>
    );
}