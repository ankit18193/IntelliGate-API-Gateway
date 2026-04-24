import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { UserModel } from "@/models/user.model";
import { connectDB } from "@/lib/db";

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     description: Returns JWT token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@test.com
 *               password:
 *                 type: string
 *                 example: 1234
 *     responses:
 *       200:
 *         description: Login success
 *       401:
 *         description: Invalid credentials
 */

const JWT_SECRET = process.env.JWT_SECRET || "secret";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: { message: "Email and password are required", code: 400 } },
        { status: 400 }
      );
    }

    
    const user = await UserModel.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid credentials", code: 401 } },
        { status: 401 }
      );
    }

    
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid credentials", code: 401 } },
        { status: 401 }
      );
    }

    
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return NextResponse.json({
      success: true,
      data: { token },
    });

  } catch (err: unknown) {
    console.error("🔥 Login Error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Login failed", code: 500 } },
      { status: 500 }
    );
  }
}