import { NextRequest, NextResponse } from "next/server";
import AdminSchema from "@/schemas/adminSchema";
import { connectDB } from "@/db";
import { authAdmin } from "@/utils/authAdmin";
import { logAdminAction } from "@/utils/logAdminAction";
import bcrypt from "bcrypt";

connectDB();

// GET: عرض جميع المشرفين
export async function GET(request: NextRequest) {
  try {
    const authResult = await authAdmin(request, ["superadmin"]);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const admins = await AdminSchema.find({}).select("-password");

    return NextResponse.json({ admins }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: إضافة مشرف جديد
export async function POST(request: NextRequest) {
  try {
    const authResult = await authAdmin(request, ["superadmin"]);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    const adminId = authResult.adminId;

    const reqBody = await request.json();
    const { username, email, password, role } = reqBody;

    if (!username || !email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new AdminSchema({
      username,
      email,
      password: hashedPassword,
      role,
    });

    await newAdmin.save();

    await logAdminAction(adminId, "ADD_ADMIN", `Admin Email: ${email}`, { role });

    return NextResponse.json({ message: "Admin added successfully", admin: newAdmin.toObject({ getters: true, virtuals: false }) }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: تعديل بيانات مشرف
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authAdmin(request, ["superadmin"]);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    const adminId = authResult.adminId;

    const reqBody = await request.json();
    const { adminToUpdateId, updateData } = reqBody;

    if (!adminToUpdateId || !updateData) {
      return NextResponse.json(
        { error: "Missing adminToUpdateId or updateData" },
        { status: 400 }
      );
    }

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedAdmin = await AdminSchema.findByIdAndUpdate(
      adminToUpdateId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedAdmin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    await logAdminAction(adminId, "UPDATE_ADMIN", `Admin ID: ${adminToUpdateId}`, { updateData });

    return NextResponse.json({ message: "Admin updated successfully", admin: updatedAdmin }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: حذف مشرف
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authAdmin(request, ["superadmin"]);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    const adminId = authResult.adminId;

    const { searchParams } = new URL(request.url);
    const adminToDeleteId = searchParams.get("adminId");

    if (!adminToDeleteId) {
      return NextResponse.json({ error: "Missing adminId" }, { status: 400 });
    }

    const deletedAdmin = await AdminSchema.findByIdAndDelete(adminToDeleteId);

    if (!deletedAdmin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    await logAdminAction(adminId, "DELETE_ADMIN", `Admin ID: ${adminToDeleteId}`, { email: deletedAdmin.email });

    return NextResponse.json({ message: "Admin deleted successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
