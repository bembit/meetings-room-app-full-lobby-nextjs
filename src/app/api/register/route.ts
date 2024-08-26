import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcrypt";
import { z } from "zod";

// Define the same schema used on the client side
const formSchema = z.object({
  email: z.string().email("Invalid email address").min(8, {
    message: "Email must be at least 8 characters.",
  }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/[0-9]/, { message: "Password must contain at least one number." })
    .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: "Password must contain at least one special character." }),
});

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();

    // Validate the request data with Zod
    const parsedData = formSchema.safeParse(body);

    if (!parsedData.success) {
      // If validation fails, return a 400 response with the errors
      const errorMessages = parsedData.error.issues.map((issue) => issue.message);
      return NextResponse.json(
        { error: errorMessages.join(", ") },
        { status: 400 }
      );
    }

    const { email, password } = parsedData.data;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash the password and save the user
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    return NextResponse.json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
