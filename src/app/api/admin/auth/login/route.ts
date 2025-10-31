import { NextRequest, NextResponse } from "next/server";
import AdminSchema from "@/schemas/adminSchema";
import { connectDB } from "@/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

connectDB();

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { email, password } = reqBody;

    // 1. تحقق من وجود الأدمن
    const admin = await AdminSchema.findOne({ email });
    if (!admin) {
      return NextResponse.json(
        { error: "Admin not found" },
        { status: 400 }
      );
    }

    // 2. تحقق من كلمة المرور
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 400 }
      );
    }

    // 3. إنشاء رمز JWT
    const tokenData = {
      id: admin._id,
      username: admin.username,
      role: admin.role,
    };

    const token = jwt.sign(tokenData, process.env.TOKEN_SECRET!, {
      expiresIn: "1d",
    });

    // 4. إرسال الرمز في ملف تعريف الارتباط (Cookie)
    const response = NextResponse.json({
      message: "Login successful",
      success: true,
    });

    response.cookies.set("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
