// server-side route for creating a new room

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Room from "@/models/Room";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import mongoose from "mongoose";

interface RoomData {
  name: string;
  creatorId: string;
  participants: string[];
}

export async function POST(request: Request)   
 {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    await dbConnect();

    const { name, creatorId, participants } = await request.json() as RoomData;

    const newRoom = new Room({
      name,
      // revisit tomorrow
      creatorId: new mongoose.Types.ObjectId(creatorId),
      participants: participants.map(participantId => new mongoose.Types.ObjectId(participantId))
    });
    
    await newRoom.save();

    return NextResponse.json({ message: "Room created successfully", roomId: newRoom._id });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      { error: "An error occurred while creating the room" },
      { status: 500 }
    );
  }
}