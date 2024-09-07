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

    // Find the room first to check if it has started
    const room = await Room.findById(params.roomId);

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // If the room is already started, block the action
    if (room.isStarted) {
      return NextResponse.json({ error: 'Room has already started, action not allowed' }, { status: 403 });
    }

    // Proceed with adding the user to side1 if the room has not started
    const updatedRoom = await Room.findByIdAndUpdate(
      params.roomId,
      {
        $addToSet: { side1: session.user._id }, // Add the user to side1
        $pull: { participants: session.user._id, side2: session.user._id }, // Remove from other groups
        // $pull: { side2: session.user._id }, // Remove from other groups
      },
      { new: true }
    );

    return NextResponse.json({ message: "Joined side 1 successfully", room: updatedRoom });
  } catch (error) {
    console.error("Error joining side 1:", error);
    return NextResponse.json(
      { error: "An error occurred while trying to join side 1" },
      { status: 500 }
    );
  }
}
