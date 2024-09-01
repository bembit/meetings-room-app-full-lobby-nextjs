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
    // need to validate if the user is already in a side
    const room = await Room.findByIdAndUpdate(
      params.roomId,
      { $addToSet: { participants: session.user._id } }, // Add user to participants if not already present
      { new: true } // Return the updated room document
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