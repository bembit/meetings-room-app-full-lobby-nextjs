'use client';

import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Loading from "@/components/Loading";

import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

export default function RoomPage({ params }: { params: { roomId: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [roomData, setRoomData] = useState<any>(null);
  const [isParticipant, setIsParticipant] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { toast } = useToast();

  const [participantReadyStates, setParticipantReadyStates] = useState<Record<string, boolean>>({});

  // const [elapsedTime, setElapsedTime] = useState(0); // State to track elapsed time in seconds
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null); 


  const handleGenerateInviteLink = () => {
    const inviteLink = `${window.location.origin}/api/invite/${roomData.inviteCode}`;
    navigator.clipboard.writeText(inviteLink) 
      .then(() => {
        console.log('Invite link copied to clipboard!');
        toast({
          // variant: "destructive",
          title: 'Invite link copied to clipboard!',
          description: 'This is your invite link. Share it with your friends!',
        })
      })
      .catch((err) => {
        console.error('Failed to copy invite link:', err);
      });
  };

  const fetchRoomData = async () => {
    try {
      if (!session) { 
        router.push("/");
        return;
      }
  
      const response = await fetch(`/api/rooms/${params.roomId}`);
      if (response.ok) {
        const data = await response.json();
        
        // Only update room data if it's different from the current roomData
        if (!roomData || JSON.stringify(roomData) !== JSON.stringify(data)) {
          setRoomData(data);
          
          const TIMEOUT_DURATION = 1 * 60 * 1000;
  
          if (data.createdAt && !data.isStarted) {
            const currentTime = new Date();
            const createdAt = new Date(data.createdAt);
            const elapsedMilliseconds = currentTime - createdAt;
            const timeRemainingMilliseconds = TIMEOUT_DURATION - elapsedMilliseconds;
  
            // Only update timeRemaining if it differs from the current value
            const calculatedTimeRemaining = Math.max(0, Math.floor(timeRemainingMilliseconds / 1000));
            if (calculatedTimeRemaining !== timeRemaining) {
              setTimeRemaining(calculatedTimeRemaining);
            }
          } else {
            setTimeRemaining(null);
          }
  
          // Update participant ready states
          const initialReadyStates = {};
          data.readyParticipants.forEach(participant => {
            initialReadyStates[participant.userId.toString()] = participant.isReady;
          });
          setParticipantReadyStates(initialReadyStates);
        }
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

      const isValidRoomId = /^[0-9a-fA-F]{24}$/.test(params.roomId);

      if (!isValidRoomId) {
        setError("Invalid room ID.");
        // toast({
        //   variant: "destructive",
        //   title: 'That is not a valid room ID.',
        //   description: 'Check the room ID and try again.',
        // })
        router.push("/rooms");
      }

      fetchRoomData();
      checkReadiness();

      const intervalId = setInterval(fetchRoomData, 5000); // Polling interval

      // Clean up the interval on component unmount
      return () => clearInterval(intervalId);
    }
  }, [params.roomId, session, router, status]); 

  // Update timeRemaining every second
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    // Prevent the timer or room deletion if the room has started
    if (roomData && !roomData.isStarted && timeRemaining !== null && timeRemaining > 0) {
      intervalId = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeRemaining === 0 && !roomData.isStarted) {
      // Timer expired, handle room deletion only if room has not started
      handleDeleteRoom();
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };

    }, [timeRemaining, roomData]);

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
    try {
      const response = await fetch(`/api/rooms/${params.roomId}/start`, {
        method: "POST",
      });

      if (response.ok) {
        // Redirect all participants to the start page
        router.push(`/rooms/${params.roomId}/start`);
      } else {
        // ... error handling
      }
    } catch (err) {
      // ... error handling
    }
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
      <div className="w-full max-w-4xl shadow-md rounded-lg p-6 bg-slate-50 dark:bg-slate-800">
        <h1 className="text-4xl font-bold text-center mb-6 text-slate-800 dark:text-slate-200">
          Room name: {roomData?.name}
        </h1>
  
        {(session?.user?._id === roomData?.creatorId?._id) && !isEveryoneReady && (
          <Button className="mb-4 bg-red-500 hover:bg-red-600 text-white" onClick={handleDeleteRoom}>
            Delete Room
          </Button>
        )}

        {/* Display the countdown timer if the room is not started */}
        {!roomData?.isStarted && timeRemaining !== null && (
          <p>Time remaining: {formatElapsedTime(timeRemaining)}</p>
        )}

        {/* Display a message when the room has started */}
        {roomData?.isStarted && (
          <p>Room started, timer stopped.</p>
        )}
  
        <div className="mb-6 p-4 bg-slate-200 rounded-lg dark:bg-slate-700">
          <span className="font-semibold">Owner:</span> {roomData?.creatorId?.email || "Unknown"}
        </div>
  
        <Button className="mb-6 bg-blue-500 hover:bg-blue-600 text-white" onClick={handleGenerateInviteLink}>
          Copy Invite Link
        </Button>
  
        <h2 className="text-xl font-semibold mb-4">Participants to choose side:</h2>
        <ul className="mb-6 flex flex-col space-y-2">
          {roomData?.participants.map((participant) => (
            <li className="flex justify-between items-center bg-slate-200 p-4 rounded-lg dark:bg-slate-700" key={participant._id.toString()}>
              <span>{participant.email} &nbsp; Waiting to choose sides.</span>
              {session?.user?._id === roomData?.creatorId?._id && participant._id.toString() !== session?.user?._id && (
                <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={() => handleKickUser(participant._id.toString())}>
                  Kick
                </Button>
              )}
            </li>
          ))}
        </ul>
  
        <h2 className="text-xl font-semibold mb-4">Side 1:</h2>
        <ul className="mb-6 flex flex-col space-y-2">
          {roomData?.side1.map((participant) => (
            <li className="flex justify-between items-center bg-slate-200 p-4 rounded-lg dark:bg-slate-700" key={participant._id.toString()}>
              <span>{participant.email}</span>
              <span className="ml-4">
                {participantReadyStates[participant._id.toString()] ? "Ready" : "Not Ready"}
              </span>
              {session?.user?._id === roomData?.creatorId?._id && participant._id.toString() !== session?.user?._id && (
                <Button className="ml-4 bg-red-500 hover:bg-red-600 text-white" onClick={() => handleKickUser(participant._id.toString())}>
                  Kick
                </Button>
              )}
              {participant._id.toString() === session?.user?._id && (
                <label className="relative inline-block">
                <input
                  type="checkbox"
                  checked={participantReadyStates[participant._id.toString()] || false}
                  onChange={(e) => handleReadyStateChange(participant._id.toString(), e.target.checked)}
                  className="appearance-none h-6 w-6 border border-gray-300 rounded-md cursor-pointer bg-red-500 border-red-500 checked:bg-green-500 checked:border-green-500 focus:outline-none"
                />
                {/* Green checkmark for the ready state */}
                <span
                  className={`absolute left-1 top-1 text-white text-xs ${
                    participantReadyStates[participant._id.toString()] ? 'block' : 'hidden'
                  }`}
                >
                  ✓
                </span>
                {/* Red X for the not ready state */}
                <span
                  className={`absolute left-1 top-1 text-white text-xs ${
                    !participantReadyStates[participant._id.toString()] ? 'block' : 'hidden'
                  }`}
                >
                  ✕
                </span>
                </label>
              )}
            </li>
          ))}
        </ul>
  
        <h2 className="text-xl font-semibold mb-4">Side 2:</h2>
        <ul className="mb-6 flex flex-col space-y-2">
          {roomData?.side2.map((participant) => (
            <li className="flex justify-between items-center bg-slate-200 p-4 rounded-lg dark:bg-slate-700" key={participant._id.toString()}>
              <span>{participant.email}</span>
              <span className="ml-4">
                {participantReadyStates[participant._id.toString()] ? "Ready" : "Not Ready"}
              </span>
              {session?.user?._id === roomData?.creatorId?._id && participant._id.toString() !== session?.user?._id && (
                <Button className="ml-4 bg-red-500 hover:bg-red-600 text-white" onClick={() => handleKickUser(participant._id.toString())}>
                  Kick
                </Button>
              )}
              {participant._id.toString() === session?.user?._id && (
                <label className="relative inline-block">
                <input
                  type="checkbox"
                  checked={participantReadyStates[participant._id.toString()] || false}
                  onChange={(e) => handleReadyStateChange(participant._id.toString(), e.target.checked)}
                  className="appearance-none h-6 w-6 border border-gray-300 rounded-md cursor-pointer bg-red-500 border-red-500 checked:bg-green-500 checked:border-green-500 focus:outline-none"
                />
                {/* Green checkmark for the ready state */}
                <span
                  className={`absolute left-1 top-1 text-white text-xs ${
                    participantReadyStates[participant._id.toString()] ? 'flex' : 'hidden'
                  }`}
                >
                  ✓
                </span>
                {/* Red X for the not ready state */}
                <span
                  className={`absolute left-1 top-1 text-white text-xs ${
                    !participantReadyStates[participant._id.toString()] ? 'flex' : 'hidden'
                  }`}
                >
                  ✕
                </span>
                </label>
              )}
            </li>
          ))}
        </ul>
  
        <div className="flex space-x-4">
        {!participantReadyStates[session?.user?._id] && (
          <>
            {isParticipant && !isOnSide1 && !isOnSide2 && (
              <>
                <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={handleJoinSide1}>
                  Join Side 1
                </Button>
                <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={handleJoinSide2}>
                  Join Side 2
                </Button>
              </>
            )}
  
            {isOnSide1 && (
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-white" onClick={handleJoinSide2}>
                Switch to Side 2
              </Button>
            )}
  
            {isOnSide2 && (
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-white" onClick={handleJoinSide1}>
                Switch to Side 1
              </Button>
            )}
          </>
        )}
  
        {!isParticipant && !isOnSide1 && !isOnSide2 && (
          <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={handleJoinRoom}>
            Join Room
          </Button>
        )}
  
        {!isParticipant && !isEveryoneReady && (
          <Button className="bg-gray-500 hover:bg-gray-600 text-white" onClick={handleJoinRoom}>
            Back to waiting room
          </Button>
        )}
  
        {(isParticipant || isOnSide1 || isOnSide2) && !isEveryoneReady && (
          <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={handleLeaveRoom}>
            Leave Room
          </Button>
        )}
  
        </div>

        <p className="text-center font-semibold mt-6">
          {isEveryoneReady ? "Everyone is ready, waiting for lobby leader!" : "Waiting for players to ready..."}
        </p>
        

        {isCreator && (
          <div className="text-center mt-6">
            {isEveryoneReady ? (
              <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={handleStartRoom}>
                Start Room
              </Button>
            ) : (
              <Button className="bg-gray-500 text-white" disabled>
                Start Room
              </Button>
            )}
          </div>
        )}
  
        <Toaster />
      </div>
  );
}

// Helper function to format elapsed time
function formatElapsedTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}