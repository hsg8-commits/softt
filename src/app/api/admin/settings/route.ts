import { NextRequest, NextResponse } from "next/server";
import SettingSchema from "@/schemas/settingSchema";
import { connectDB } from "@/db";
import { authAdmin } from "@/utils/authAdmin";
import { logAdminAction } from "@/utils/logAdminAction";

connectDB();

// GET: جلب جميع الإعدادات
export async function GET(request: NextRequest) {
  try {
    const authResult = await authAdmin(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const settings = await SettingSchema.find({});

    return NextResponse.json({ settings }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: تعديل إعداد موجود أو إضافته إذا لم يكن موجودًا
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authAdmin(request, ["superadmin"]);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    const adminId = authResult.adminId;

    const reqBody = await request.json();
    const { key, value, description } = reqBody;

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: "Missing key or value" },
        { status: 400 }
      );
    }

    const updatedSetting = await SettingSchema.findOneAndUpdate(
      { key },
      { value, description, updatedBy: adminId, updatedAt: new Date() },
      { new: true, upsert: true, runValidators: true }
    );

    await logAdminAction(adminId, "UPDATE_SETTING", `Setting Key: ${key}`, { value, description });

    return NextResponse.json({ message: "Setting updated successfully", setting: updatedSetting }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
