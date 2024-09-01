import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Room from "@/models/Room";

export async function GET(request: Request, { params }: { params: { roomId: string } }) {
  try {
    await connectDB();

    const room = await Room.findById(params.roomId)
      .populate("creatorId", "email")
      .populate("participants", "email")
      .populate("side1", "email")
      .populate("side2", "email");

    if (!room) {
      return new Response("Room not found", { status: 404 });
    }

    return NextResponse.json(room);
  } catch (error) {
    console.error("Error fetching room data:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching room data" },
      { status: 500 }
    );
  }
}