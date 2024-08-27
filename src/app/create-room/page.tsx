'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function CreateRoom() {
  const [roomName, setRoomName] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  const { data: session } = useSession(); 


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/rooms`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                  name: roomName,
                  creatorId: session?.user._id,
                  participants: [session?.user._id],
                }),
              });

              if (response.ok) {
                const data = await response.json();
                router.push(`/rooms/${data.roomId}`); // Redirect to the newly created room
              } else {
                const data = await response.json();
                setError(data.error || "An error occurred while creating the room.");
              }
            } catch (err) {
              console.error("Error creating room:", err);
              setError("An unexpected error occurred. Please try again later.");
            }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div>
        <h1 className="text-3xl font-bold mb-4">Create a New Room</h1>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="text"
            placeholder="Room Name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="border p-2 rounded"
            required
          />
          {error && <p className="text-red-500">{error}</p>}
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Create Room
          </button>
        </form>
      </div>
    </main>
  );
}