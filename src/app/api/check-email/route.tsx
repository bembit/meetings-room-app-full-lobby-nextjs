import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { email } = await request.json();

    const existingUser = await User.findOne({ email });
    return NextResponse.json({ available: !existingUser });
  } catch (error) {
    console.error("Error checking email:", error);
    return NextResponse.json({ available: false }, { status: 500 });
  }
}
