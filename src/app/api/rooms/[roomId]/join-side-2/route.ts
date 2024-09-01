// app/api/rooms/[roomId]/join-side1/route.ts
import { NextResponse } from "next/server";
// ... other imports

export async function POST(request: Request, { params }: { params: { roomId: string } }) {
  try {
    // ... (authentication and database connection logic)

    // Find the room and update the side1 array
    const room = await Room.findByIdAndUpdate(
      params.roomId,
      {
        $addToSet: { side2: session.user.id }, 
        $pull: { participants: session.user.id } // Remove from lobby
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