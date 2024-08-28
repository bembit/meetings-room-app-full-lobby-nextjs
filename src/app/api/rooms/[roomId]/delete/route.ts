import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Room from "@/models/Room";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function DELETE(request: Request, { params }: { params: { roomId: string } }) {
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

    if (room.creatorId.toString() !== session.user._id) {
      return new Response("Forbidden - Only the room creator can delete the room", { status: 403 });
    }

    await room.deleteOne();

    return NextResponse.json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error("Error deleting room:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting the room" },
      { status: 500 }
    );
  }
}