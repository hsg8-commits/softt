import { NextResponse } from "next/server";
import LogSchema from "@/schemas/logSchema";
import { connectDB } from "@/db";
import { authAdmin } from "@/utils/authAdmin";

connectDB();

// GET: عرض سجلات المشرفين
export async function GET(request: Request) {
  try {
    const authResult = await authAdmin(request, ["superadmin"]);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const logs = await LogSchema.find({})
      .populate("adminId", "username email role")
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const totalLogs = await LogSchema.countDocuments();

    return NextResponse.json({ logs, totalLogs, page, limit }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
