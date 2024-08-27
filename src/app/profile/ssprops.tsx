import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import DropdownMenuDemo from "@/components/DropdownMenuDemo";
import Nav from "@/components/Nav";

export default function Profile({ session }) {
  // Optional client-side logic can go here if needed.
  
  return (
    <main className="flex min-h-screen flex-col items-center">
      <Nav />
      <div>
        <DropdownMenuDemo email={session.user.email} />
        <h2 className="text-3xl font-bold mb-4">
          Welcome, {session.user.email}!
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

// This function runs on the server before the page is rendered.
export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    // If no session, redirect to the home page
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  // If session exists, pass it to the page component as a prop
  return {
    props: {
      session,
    },
  };
}
