import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Room from "@/models/Room";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function POST(request: Request, { params }: { params: { roomId: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    await connectDB();

    const room = await Room.findById(params.roomId);

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Check if the current user is the creator of the room
    if (room.creatorId.toString() !== session.user._id) {
      return new Response("Forbidden - Only the room creator can start the room", { status: 403 });
    }

    // everyone is ready
    // update the room's status to "started" if needed

    return NextResponse.json({ message: "Room started successfully" });
  } catch (error) {
    console.error("Error starting room:", error);
    return NextResponse.json(
      { error: "An error occurred while starting the room" },
      { status: 500 }
    );
  }
}