import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Room from "@/models/Room";

export async function GET(request: Request, { params }: { params: { inviteCode: string } }) {
  try {
    await connectDB();

    const room = await Room.findOne({ inviteCode: params.inviteCode });

    // check if the room is full
    // check if room has already started
    // user is already in the room

    if (!room) {
      return new Response("Invalid invite code", { status: 404 });
    }

    // Construct the absolute URL for redirection
    const url = new URL(`/rooms/${room._id}`, request.url); 

    return NextResponse.redirect(url);
  } catch (error) {
    console.error("Error handling invite:", error);
    return new Response("An error occurred", { status: 500 });
  }
}
