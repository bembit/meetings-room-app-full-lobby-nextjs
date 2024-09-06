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

    // Find the room and update the participants array
    const room = await Room.findByIdAndUpdate(
      params.roomId,
      {
        $addToSet: { participants: session.user._id }, // Add user to participants
        $pull: { side1: session.user._id, side2: session.user._id, readyParticipants: { userId: session.user._id } } // Remove from both sides
      },
      { new: true } 
    );

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({ message: "Joined room successfully" });
  } catch (error) {
    console.error("Error joining room:", error);
    return NextResponse.json(
      { error: "An error occurred while joining the room" },
      { status: 500 }
    );
  }
}