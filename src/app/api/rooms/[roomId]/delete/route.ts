import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Room from "@/models/Room";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function DELETE(request: Request, { params }: { params: { roomId: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    await dbConnect();

    const room = await Room.findById(params.roomId);

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.creatorId.toString() !== session.user._id) {
      // return new Response("Forbidden - Only the room creator can delete the room", { status: 403 });
      return NextResponse.json("Forbidden - Only the room creator can delete the room", { status: 403 });
    }

    if (room.isStarted) {
      // return new Response("Forbidden - Room is started, cannot be deleted", { status: 403 });
      return NextResponse.json({ error: "Room started, cannot delete" }, { status: 403 });
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