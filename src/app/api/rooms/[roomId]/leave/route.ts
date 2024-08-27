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

    const room = await Room.findByIdAndUpdate(
      params.roomId,
      { $pull: { participants: session.user.id } }, // Remove user from participants
      { new: true }
    );

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({ message: "Left room successfully" });
  } catch (error) {
    console.error("Error leaving room:", error);
    return NextResponse.json(
      { error: "An error occurred while leaving the room" },
      { status: 500 }
    );
  }
}