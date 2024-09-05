'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Loading from "@/components/Loading";

import { Button } from "@/components/ui/button";
import Nav from "@/components/Nav";

export default function RoomPage({ params }: { params: { roomId: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [roomData, setRoomData] = useState<any>(null);
  const [isParticipant, setIsParticipant] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [participantReadyStates, setParticipantReadyStates] = useState<Record<string, boolean>>({});

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

        // Initialize participantReadyStates based on readyParticipants from the server
        const initialReadyStates: Record<string, boolean> = {};
        data.readyParticipants.forEach((participant) => {
          initialReadyStates[participant.userId.toString()] = participant.isReady;
        });
        setParticipantReadyStates(initialReadyStates);

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

  const handleReadyStateChange = async (userId: string, isReady: boolean) => {
    try {
      const response = await fetch(`/api/rooms/${params.roomId}/ready`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isReady }),
      });

      if (response.ok) {
        // setIsReady(isReady);
        setParticipantReadyStates((prevStates) => ({
          ...prevStates,
          [userId]: isReady,
        }));
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

  const handleStartRoom = async () => {
    alert("Starting the room...");
  };

  // will do for now : check if everyone in the room is ready
  const isEveryoneReady = 
    roomData?.participants.every(participant => participantReadyStates[participant._id.toString()]) &&
    roomData?.side1.every(participant => participantReadyStates[participant._id.toString()]) &&
    roomData?.side2.every(participant => participantReadyStates[participant._id.toString()]);

  const isOnSide1 = roomData?.side1.some(
    (participant) => participant._id.toString() === session?.user?._id
  );
  const isOnSide2 = roomData?.side2.some(
    (participant) => participant._id.toString() === session?.user?._id
  );

  if (status === "loading" || isLoading) {
    return <Loading />;
  } else if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const isCreator = roomData?.creatorId?._id.toString() === session?.user?._id.toString();

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
                  {/* Conditionally render the Kick button */}
                  {session?.user?._id === roomData?.creatorId?._id && participant._id.toString() !== session?.user?._id && ( // Exclude the creator from being kicked
                    <Button onClick={() => handleKickUser(participant._id.toString())}>
                      Kick
                    </Button>
                  )}
                  <span className="ml-2"> 
                    {/* Display readiness status for all participants */}
                    {participantReadyStates[participant._id.toString()] ? "Ready" : "Not Ready"}
                  </span>
                  {/* Conditionally render the checkbox only for the current user */}
                  {participant._id.toString() === session?.user?._id && ( 
                    <label className="ml-2"> 
                      <input
                        type="checkbox"
                        checked={participantReadyStates[participant._id.toString()] || false}
                        onChange={(e) => handleReadyStateChange(participant._id.toString(), e.target.checked)}
                      />
                    </label>
                  )}
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
                  {/* Conditionally render the Kick button */}
                  {session?.user?._id === roomData?.creatorId?._id && participant._id.toString() !== session?.user?._id && ( // Exclude the creator from being kicked
                    <Button onClick={() => handleKickUser(participant._id.toString())}>
                      Kick
                    </Button>
                  )}
                  <span className="ml-2">
                    {participantReadyStates[participant._id.toString()] ? "Ready" : "Not Ready"}
                  </span>
                  {participant._id.toString() === session?.user?._id && (
                    <label className="ml-2">
                      <input
                        type="checkbox"
                        checked={participantReadyStates[participant._id.toString()] || false}
                        onChange={(e) => handleReadyStateChange(participant._id.toString(), e.target.checked)}
                      />
                    </label>
                  )}
                </>
              </li>
            ))}
          </ul>

          {/* Conditionally render Join Side buttons or Switch Side button only if the current user is NOT ready */}
          {!participantReadyStates[session?.user?._id] && ( 
            <>
              {isParticipant && !isOnSide1 && !isOnSide2 && (
                <>
                  <Button onClick={handleJoinSide1}>Join Side 1</Button>
                  <Button onClick={handleJoinSide2}>Join Side 2</Button>
                </>
              )}

              {isOnSide1 && (
                <Button onClick={handleJoinSide2}>Switch to Side 2</Button>
              )}

              {isOnSide2 && (
                <Button onClick={handleJoinSide1}>Switch to Side 1</Button>
              )}
            </>
          )}

        {!isParticipant && !isOnSide1 && !isOnSide2 && (
          <Button onClick={handleJoinRoom}>Join Room</Button>
        )}

        {!isParticipant && (
          <Button onClick={handleJoinRoom}>Back to waiting room</Button>
        )}

        {/* if all participants ready and have sides and all valid, host can start meeting room */}

        {isParticipant && isOnSide1 && isOnSide2 && (
          <Button onClick={handleLeaveRoom}>Leave Room</Button>
        )}

        <br />
        <br />
        <br />

        {/* Display "Waiting for players to ready" or "Everyone is ready" message */}
        {/* {!isCreator && ( */}
        <p>
            {isEveryoneReady ? "Everyone is ready, waiting for lobby leader!" : "Waiting for players to ready..."}
          </p>
        {/* )} */}

        {/* Conditionally render the Start Room button only for the creator */}
        {isCreator && ( 
          isEveryoneReady ? (
            <Button onClick={handleStartRoom}>Start Room</Button>
          ) : (
            <Button disabled>Start Room</Button> 
          )
        )}

      </div>
    </main>
  );
}
