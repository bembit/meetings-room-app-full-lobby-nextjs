import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Room from "@/models/Room";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../auth/[...nextauth]/route";

export async function POST(request: Request, { params }: { params: { roomId: string, userId: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    await connectDB();

    const room = await Room.findById(params.roomId);

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Check if the current user is the creator of the room
    if (room.creatorId.toString() !== session.user._id) {
      return new Response("Forbidden - Only the room creator can kick users", { status: 403 });
    }

    // Remove the specified user from the participants array
    room.participants.pull(params.userId);
    room.side1.pull(params.userId);
    room.side2.pull(params.userId);
    room.readyParticipants.filter((participant) => participant.userId.toString() !== params.userId);
    await room.save();

    return NextResponse.json({ message: "User kicked successfully" });
  } catch (error) {
    console.error("Error kicking user:", error);
    return NextResponse.json(
      { error: "An error occurred while kicking the user" },
      { status: 500 }
    );
  }
}