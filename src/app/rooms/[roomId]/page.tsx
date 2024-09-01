'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import Nav from "@/components/Nav";

export default function RoomPage({ params }: { params: { roomId: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [roomData, setRoomData] = useState<any>(null);
  const [isParticipant, setIsParticipant] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRoomData = async () => {
    try {
      if (!session) { // Check if session is available
        router.push("/");
        return;
      }

      const response = await fetch(`/api/rooms/${params.roomId}`);
      if (response.ok) {
        const data = await response.json();
        setRoomData(data);
        setIsParticipant(
          data.participants.some(
            // (participant) => participant._id.toString() === session.user._id // id _id id _id id _id
            (participant) => participant._id.toString() === session.user._id // id _id id _id id _id
          )
        );
      } else {
        setError("Failed to fetch room data.");
      }
    } catch (err) {
      console.error("Error fetching room data:", err);
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch room data if the user is authenticated
    if (status === "authenticated") {
      fetchRoomData();

      const intervalId = setInterval(fetchRoomData, 5000); // Polling interval

      // Clean up the interval on component unmount
      return () => clearInterval(intervalId);
    }
  }, [params.roomId, session, router, status]); 


  const handleJoinRoom = async () => {
    try {
      const response = await fetch(`/api/rooms/${params.roomId}/join`, {
        method: "POST",
      });

      if (response.ok) {
        setIsParticipant(true);
        // Optionally, you can refetch the room data to update the participant list
        await fetchRoomData();
      } else {
        const data = await response.json();
        console.error("Error joining room:", data.error);
        // Handle the error (e.g., display an error message)
      }
    } catch (err) {
      console.error("Error joining room:", err);
      // Handle the error
    }
  };

  const handleLeaveRoom = async () => {
    try {
      const response = await fetch(`/api/rooms/${params.roomId}/leave`, {
        method: "POST",
      });

      if (response.ok) {
        setIsParticipant(false);
        // Optionally, you can refetch the room data to update the participant list
        await fetchRoomData();
      } else {
        const data = await response.json();
        console.error("Error leaving room:", data.error);
        // Handle the error 
      }
    } catch (err) {
      console.error("Error leaving room:", err);
      // Handle the error
    }
  };

  const handleKickUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/rooms/${params.roomId}/kick/${userId}`, {
        method: "POST",
      });

      if (response.ok) {
        // Refetch room data or update the participant list locally
        await fetchRoomData();
      } else {
        // ... error handling
      }
    } catch (err) {
      // ... error handling
    }
  };

  const handleDeleteRoom = async () => {
    try {
      const response = await fetch(`/api/rooms/${params.roomId}/delete`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push('/rooms'); // Redirect to the rooms list after deletion
      } else {
        // ... error handling
      }
    } catch (err) {
      // ... error handling
    }
  };

  const handleJoinSide1 = async () => {
    try {
      const response = await fetch(`/api/rooms/${params.roomId}/join-side-1`, {
        method: "POST",
      });

      if (response.ok) {
        await fetchRoomData(); 
      } else {
        // ... error handling
      }
    } catch (err) {
      // ... error handling
    }
  };

  const handleJoinSide2 = async () => {
    try {
      const response = await fetch(`/api/rooms/${params.roomId}/join-side-2`, {
        method: "POST",
      });

      if (response.ok) {
        await fetchRoomData(); 
      } else {
        // ... error handling
      }
    } catch (err) {
      // ... error handling
    }
  };

  // ... (rest of your component code)

  if (status === "loading" || isLoading) {
    return <div>Loading...</div>;
  } else if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center">
      <Nav />
      <div>
        <h1 className="text-3xl font-bold mb-4">
          Room name: {roomData?.name}
        </h1>
        {session?.user?._id === roomData?.creatorId?._id && (
          <Button onClick={handleDeleteRoom}>Delete Room</Button>
        )}
        <p>
          Owner:{" "}
          {roomData?.creatorId?.email || "Unknown"}
        </p>

        <h2>Participants:</h2>
        <ul>
          {roomData?.participants.map((participant) => (
            <li key={participant._id.toString()}>
              {participant.email}
              {/* Conditionally render the Kick button */}
              {session?.user?._id === roomData?.creatorId?._id && participant._id.toString() !== session?.user?._id && ( // Exclude the creator from being kicked
                <Button onClick={() => handleKickUser(participant._id.toString())}>
                  Kick
                </Button>
              )}
            </li>
          ))}
        </ul>

        {/* sides test */}
          <h2>Side 1:</h2>
          <ul>
            {roomData?.side1?.map((participant) => (
              <li key={participant._id.toString()}>{participant.email}</li>
            ))}
          </ul>

          <h2>Side 2:</h2>
          <ul>
            {roomData?.side2?.map((participant) => (
              <li key={participant._id.toString()}>{participant.email}</li>
            ))}
          </ul>

          {/* Conditionally render Join Side buttons if the user is in the lobby */}
          {isParticipant && (
            <>
              <button onClick={handleJoinSide1}>Join Side 1</button>
              <button onClick={handleJoinSide2}>Join Side 2</button>
            </>
          )}

        {!isParticipant && (
          <Button onClick={handleJoinRoom}>Join Room</Button>
        )}

        {isParticipant && (
          <Button onClick={handleLeaveRoom}>Leave Room</Button>
        )}
        {/* isCreator should be able to delete the room */}
      </div>
    </main>
  );
}
