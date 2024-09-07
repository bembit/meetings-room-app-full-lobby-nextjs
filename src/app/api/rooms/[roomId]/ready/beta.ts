import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Room from "@/models/Room";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function POST(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    await dbConnect();

    const { isReady } = await request.json();

    const room = await Room.findOne({ _id: params.roomId });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Check if the room has started and block readiness updates if it has
    if (room.isStarted) {
      return NextResponse.json({ error: "Room has started, cannot update readiness" }, { status: 403 });
    }

    const userId = session.user._id;

    const isUserInSide = room.side1.includes(userId) || room.side2.includes(userId);
    if (!isUserInSide) {
      return NextResponse.json({ error: "User is not in a team, cannot update readiness" }, { status: 403 });
    }

    // Check if readyParticipants array exists and is not empty
    if (room.readyParticipants && room.readyParticipants.length > 0) {
      const participantIndex = room.readyParticipants.findIndex(
        (participant) => participant.userId?.toString() === session.user._id // Use optional chaining here
      );

      if (isReady) {
        if (participantIndex === -1) {
          room.readyParticipants.push({ userId: session.user._id, isReady });
        } else {
          room.readyParticipants[participantIndex].isReady = isReady;
        }
      } else {
        if (participantIndex !== -1) {
          room.readyParticipants.splice(participantIndex, 1);
        }
      }
    } else if (isReady) {
      // If the array is empty and isReady is true, add the user
      room.readyParticipants.push({ userId: session.user._id, isReady });
    }

    // Check if all users in side1 and side2 are ready
    const allInSides = [...room.side1, ...room.side2];
    const allParticipantsReady = allInSides.every((participant) =>
      room.readyParticipants.some((p) => p.userId.toString() === participant.toString() && p.isReady)
    );

    if (allParticipantsReady) {

      // to be implemented based on the meeting type
      // if (room.meetingType === "video") {
            // size of the room = 10;
            // if (room.participants.length === 10) {
            // bla bla can't ready/unready anymore
      // }

      console.log("all participants ready");
      return NextResponse.json({ message: "All participants are ready" });
    }

    await room.save();

    return NextResponse.json({ message: "Readiness updated successfully" });
  } catch (error) {
    console.error("Error updating readiness:", error);
    return NextResponse.json(
      { error: "An error occurred while updating readiness" },
      { status: 500 }
    );
  }
}
