'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RoomPage({ params }: { params: { roomId: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [roomData, setRoomData] = useState<any>(null);
  const [isParticipant, setIsParticipant] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

    // Only fetch room data if the user is authenticated
    if (status === "authenticated") {
      fetchRoomData();
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
        // await fetchRoomData();
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
        // await fetchRoomData();
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

  if (status === "loading" || isLoading) {
    return <div>Loading...</div>;
  } else if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div>
        <h1 className="text-3xl font-bold mb-4">
          Room name: {roomData?.name}
        </h1>
        <p>
          Owner:{" "}
          {roomData?.creatorId?.email || "Unknown"}
        </p>

        <h2>Participants:</h2>
        <ul>
          {roomData?.participants.map((participant) => (
            <li key={participant._id.toString()}>{participant.email}</li>
          ))}
        </ul>

        {!isParticipant && (
          <button onClick={handleJoinRoom}>Join Room</button>
        )}

        {isParticipant && (
          <button onClick={handleLeaveRoom}>Leave Room</button>
        )}
        {/* isCreator should be able to delete the room */}
      </div>
    </main>
  );
}



// 'use client';

// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";

// export default function RoomPage({ params }: { params: { roomId: string } }) {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const [roomData, setRoomData] = useState<any>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchRoomData = async () => {
//       try {
//         if (!session) {
//           router.push("/"); 
//           return;
//         }

//         const response = await fetch(`/api/rooms/${params.roomId}`);
//         if (response.ok) {
//           const data = await response.json();
//           setRoomData(data);
//         } else {
//           setError("Failed to fetch room data.");
//         }
//       } catch (err) {
//         console.error("Error fetching room data:", err);
//         setError("An unexpected error occurred.");
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     if (status === "authenticated") {
//       fetchRoomData();
//     }
//   }, [params.roomId, session, router]);

//   if (status === "loading" || isLoading) {
//     return <div>Loading...</div>;
//   } else if (status === "unauthenticated") {
//     router.push("/login");
//     return null;
//   }

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   // Temporary: Display basic room information for now
//   return (
//     <main className="flex min-h-screen flex-col items-center p-24">
//       <div>
//         <h1 className="text-3xl font-bold mb-4">
//           Room name: {roomData?.name}
//         </h1>
//         {/* We'll add more details and functionality in the next steps */}
//       </div>
//     </main>
//   );
// }