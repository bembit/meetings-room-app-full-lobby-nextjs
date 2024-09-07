import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Room from "@/models/Room";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function POST(request: Request, { params }: { params: { roomId: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    await dbConnect();

    const room = await Room.findById(params.roomId);

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Check if the room has started before trying to leave
    if (room.isStarted) {
      return NextResponse.json({ error: 'Room started, cannot leave' }, { status: 403 });
    }

    // If the room has not started, allow the user to leave
    await Room.findByIdAndUpdate(
      params.roomId,
      { 
        $pull: { 
          participants: session.user._id, 
          side1: session.user._id, 
          side2: session.user._id, 
          readyParticipants: { userId: session.user._id } 
        } 
      },
      { new: true }
    );

    return NextResponse.json({ message: "Left room successfully" });
  } catch (error) {
    console.error("Error leaving room:", error);
    return NextResponse.json(
      { error: "An error occurred while leaving the room" },
      { status: 500 }
    );
  }
}
