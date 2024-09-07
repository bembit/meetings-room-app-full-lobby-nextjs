'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import HoverCardDemo from '@/components/HoverCardDemo';
import Loading from '@/components/Loading';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { data: session, status } = useSession();
  
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

  if (status === "loading" || isLoading) {
    return <Loading />;
  } else if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className='w-full max-w-4xl shadow-md rounded-lg p-6 light:bg-gray-900 dark:bg-black'>
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
    </div>
  );
}