import { NextRequest, NextResponse } from "next/server";
import { UserModel } from "@/models/user.model";
import { connectDB } from "@/lib/db";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: { message: "Email and password are required" } },
        { status: 400 }
      );
    }

   
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: { message: "User already exists" } },
        { status: 409 }
      );
    }

    
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await UserModel.create({
      email,
      passwordHash,
    });

    return NextResponse.json(
      { success: true, data: { message: "User registered successfully" } },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("🔥 Registration Error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Registration failed", code: 500 } },
      { status: 500 }
    );
  }
}