'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import HoverCardDemo from '@/components/HoverCardDemo';
import Loading from '@/components/Loading';

import Nav from "@/components/Nav";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]); // Adjust the type as needed based on your Room model
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  if (!session) { // Check if session is available
    router.push("/");
    return;
  }

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch("/api/rooms"); 
        if (response.ok) {
          const data = await response.json();
          setRooms(data);
        } else {
          setError("Failed to fetch rooms.");
        }
      } catch (err) {
        console.error("Error fetching rooms:", err);
        setError("An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center">
      <Nav />
      <h1 className="text-3xl font-bold mb-4">Available Rooms</h1>
      <ul>
        {rooms.map((room) => (
          <Link href={`/rooms/${room._id}`} passHref legacyBehavior>
            <li key={room._id} className='p-4 border border-gray-200 mb-2 rou'>
                <>
                  <p>Room Name: {room.name}</p>
                  <p>Created by:</p> {/* Display creator's email */}
                  {/* this will be hover only query for a short profile */}
                  <HoverCardDemo email={room.creatorId.email} />
                </>
            </li>
          </Link>
        ))}
      </ul>
    </main>
  );
}