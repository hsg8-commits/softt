import { NextResponse } from "next/server";
import UserSchema from "@/schemas/userSchema";
import { connectDB } from "@/db";
import { authAdmin } from "@/utils/authAdmin";
import { logAdminAction } from "@/utils/logAdminAction";

connectDB();

// GET: عرض جميع المستخدمين
export async function GET(request: Request) {
  try {
    const authResult = await authAdmin(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const users = await UserSchema.find({})
      .select("-password -roomMessageTrack")
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const totalUsers = await UserSchema.countDocuments();

    return NextResponse.json({ users, totalUsers, page, limit }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: تعديل بيانات المستخدم
export async function PUT(request: Request) {
  try {
    const authResult = await authAdmin(request, ["superadmin", "moderator"]);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    const adminId = authResult.adminId;
    const adminRole = authResult.role;

    const reqBody = await request.json();
    const { userId, updateData } = reqBody;

    if (!userId || !updateData) {
      return NextResponse.json(
        { error: "Missing userId or updateData" },
        { status: 400 }
      );
    }

    const updatedUser = await UserSchema.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password -roomMessageTrack");

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // تسجيل الإجراء في السجل (Log)
    // نحتاج لإنشاء دالة logAdminAction
    await logAdminAction(adminId, "UPDATE_USER", `User ID: ${userId}`, { updateData });

    return NextResponse.json({ message: "User updated successfully", user: updatedUser }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: حذف/حظر المستخدم (سأفترض أن الحذف هو حظر مؤقت بتغيير الحالة)
export async function DELETE(request: Request) {
  try {
    const authResult = await authAdmin(request, ["superadmin", "moderator"]);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    const adminId = authResult.adminId;
    const adminRole = authResult.role;

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const action = searchParams.get("action"); // 'block' or 'delete'

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    let update = {};
    let logAction = "";
    let message = "";

    if (action === "block") {
      update = { status: "blocked" }; // افتراض أن لدينا حالة "blocked"
      logAction = "BLOCK_USER";
      message = "User blocked successfully";
    } else if (action === "delete") {
      // في التطبيقات الحقيقية يُفضل عدم الحذف الفعلي، بل وضع علامة للحذف
      // لكن لغرض هذا المثال، سنقوم بتغيير الحالة إلى محظور
      update = { status: "deleted" }; // افتراض أن لدينا حالة "deleted"
      logAction = "DELETE_USER_MARK";
      message = "User marked as deleted successfully";
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const updatedUser = await UserSchema.findByIdAndUpdate(
      userId,
      { $set: update },
      { new: true }
    ).select("-password -roomMessageTrack");

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // تسجيل الإجراء في السجل (Log)
    await logAdminAction(adminId, logAction, `User ID: ${userId}`, { action });

    return NextResponse.json({ message, user: updatedUser }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
