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

  const [isReady, setIsReady] = useState(false); 


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

  const checkReadiness = async () => {
    try {
      if (!session) {
        return; // Or handle the case where the session is not available
      }

      const response = await fetch(`/api/rooms/${params.roomId}/is-ready`);
      if (response.ok) {
        const data = await response.json();
        setIsReady(data.isReady);
      } else {
        // Handle error fetching readiness status
      }
    } catch (err) {
      // Handle error
    }
  };

  const handleReadyStateChange = async (isReady: boolean) => {
    try {
      const response = await fetch(`/api/rooms/${params.roomId}/ready`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isReady }),
      });

      if (response.ok) {
        setIsReady(isReady); // Update the local state
      } else {
        // Handle error updating readiness status
      }
    } catch (err) {
      // Handle error
    }
  };

  useEffect(() => {
    // Only fetch room data if the user is authenticated
    if (status === "authenticated") {
      fetchRoomData();
      checkReadiness();

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

  const isOnSide1 = roomData?.side1.some(
    (participant) => participant._id.toString() === session?.user?._id
  );
  const isOnSide2 = roomData?.side2.some(
    (participant) => participant._id.toString() === session?.user?._id
  );

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
        <div className="flex flex-col space-y-2 p-4 underline">
          Owner:{" "}
          {roomData?.creatorId?.email || "Unknown"}
        </div>

        <h2>Participants to choose side:</h2>
        <ul className="flex flex-col space-y-2 p-4">
          {roomData?.participants.map((participant) => (
            <li key={participant._id.toString()}>
              {participant.email}
              &nbsp; Waiting to choose sides.
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
          <ul className="flex flex-col space-y-2 p-4">
            {roomData?.side1.map((participant) => (
              <li key={participant._id.toString()}>
                <>
                {participant.email}
                <label>
                  <input
                    type="checkbox"
                    checked={isReady}
                    onChange={(e) => handleReadyStateChange(e.target.checked)}
                  />
                  {isReady ? 'Ready' : 'Not Ready'}
                </label>
                </>
              </li>
            ))}
          </ul>

          <h2>Side 2:</h2>
          <ul className="flex flex-col space-y-2 p-4">
            {roomData?.side2.map((participant) => (
              <li key={participant._id.toString()}>
                <>
                {participant.email}
                <label>
                  <input
                    type="checkbox"
                    checked={isReady}
                    onChange={(e) => handleReadyStateChange(e.target.checked)}
                  />
                  {/* show ready or not ready based on current state */}
                  {isReady ? 'Ready' : 'Not Ready'}
                </label>
                </>
              </li>
            ))}
          </ul>

          {/* Conditionally render Join Side buttons if the user is in the lobby */}
          {isParticipant && (
            <>
              <Button onClick={handleJoinSide1}>Join Side 1</Button>
              <Button onClick={handleJoinSide2}>Join Side 2</Button>
            </>
          )}

          {isOnSide1 && <Button onClick={handleJoinSide2}>Join Side 2</Button> }
          {isOnSide2 && <Button onClick={handleJoinSide1}>Join Side 1</Button> }


        {/* if choose sides can ready up */}

        {/* if all participants ready and have sides and all valid, host can start meeting room */}

        {!isParticipant && (
          <Button onClick={handleJoinRoom}>Join Room</Button>
        )}

        {isParticipant && (
          <Button onClick={handleLeaveRoom}>Leave Room</Button>
        )}

          {/* {isParticipant && (
            <>
              <Button onClick={handleJoinSide1}>Join Side 1</Button>
              <Button onClick={handleJoinSide2}>Join Side 2</Button>
            </>
          )}

          {!isParticipant || !isOnSide1 || !isOnSide2 && (
            <Button onClick={handleJoinRoom}>Join Room</Button>
          )}

          {isParticipant || isOnSide1 || isOnSide2 && (
            <Button onClick={handleLeaveRoom}>Leave Room</Button>
          )}

          {isOnSide1 && <Button onClick={handleJoinSide2}>Join Side 2</Button> }
          {isOnSide2 && <Button onClick={handleJoinSide1}>Join Side 1</Button> } */}

      </div>
    </main>
  );
}
