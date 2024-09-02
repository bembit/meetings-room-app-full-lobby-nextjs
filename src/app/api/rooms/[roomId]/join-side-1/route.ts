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

    const room = await Room.findByIdAndUpdate(
      params.roomId,
      {
        $addToSet: { side1: session.user._id }, 
        $pull: { participants: session.user._id, side2: session.user._id, } // Remove from lobby
      },
      { new: true }
    );

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({ message: "Joined side 1 successfully" });
  } catch (error) {
    // ... error handling
  }
}