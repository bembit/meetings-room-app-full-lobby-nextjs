import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from 'next/navigation';
import connectDB from "@/lib/db";
import Room from "@/models/Room";

export default async function RoomPage({ params }: { params: { roomId: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  await connectDB();

  const room = await Room.findById(params.roomId)
    .populate('creatorId', 'email') // Populate creatorId with email
    .populate('participants', 'email'); // Populate participants with email

  if (!room) {
    return <div>Room not found</div>;
  }

  const isParticipant = room.participants.some(participant => participant._id.toString() === session.user._id);

  const handleJoinRoom = async () => {
    // ... (Implement logic to add the current user to the room's participants)
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div>
        <h1 className="text-3xl font-bold mb-4">Room name: {room.name}</h1>
        {/* Check if creatorId is populated and has an email */}
        <p>Owner: {room.creatorId && room.creatorId.email ? room.creatorId.email : 'Unknown'}</p>

        Participants:
        <ul>
          {room.participants.map((participant) => (
            <li key={participant._id.toString()}>{participant.email}</li>
          ))}
        </ul>

        {!isParticipant && (
          <button>Join Room</button>
        )}
      </div>
    </main>
  );
}