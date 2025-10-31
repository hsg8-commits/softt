import { NextResponse } from "next/server";
import ReportSchema from "@/schemas/reportSchema";
import MessageSchema from "@/schemas/messageSchema";
import UserSchema from "@/schemas/userSchema";
import { connectDB } from "@/db";
import { authAdmin } from "@/utils/authAdmin";
import { logAdminAction } from "@/utils/logAdminAction";

connectDB();

// GET: عرض جميع البلاغات
export async function GET(request: Request) {
  try {
    const authResult = await authAdmin(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || "open"; // افتراضيًا عرض البلاغات المفتوحة
    const skip = (page - 1) * limit;

    const query: any = status !== "all" ? { status } : {};

    const reports = await ReportSchema.find(query)
      .populate("reporterId", "username phone avatar")
      .populate("reportedUserId", "username phone avatar")
      .populate("reportedMessageId", "message fileData voiceData")
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const totalReports = await ReportSchema.countDocuments(query);

    return NextResponse.json({ reports, totalReports, page, limit }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: اتخاذ إجراء على بلاغ (تجاهل، حذف المحتوى، حظر المستخدم)
export async function PUT(request: Request) {
  try {
    const authResult = await authAdmin(request, ["superadmin", "moderator"]);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    const adminId = authResult.adminId;
    const adminRole = authResult.role;

    const reqBody = await request.json();
    const { reportId, action } = reqBody; // action: 'ignore', 'delete_message', 'block_user'

    if (!reportId || !action) {
      return NextResponse.json(
        { error: "Missing reportId or action" },
        { status: 400 }
      );
    }

    const report = await ReportSchema.findById(reportId);
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    let actionTaken = "";
    let logAction = "";

    switch (action) {
      case "ignore":
        actionTaken = "Ignored by Admin";
        logAction = "REPORT_IGNORED";
        break;

      case "delete_message":
        if (report.reportedMessageId) {
          await MessageSchema.findByIdAndDelete(report.reportedMessageId);
          actionTaken = "Message Deleted";
          logAction = "MESSAGE_DELETED_VIA_REPORT";
        } else {
          return NextResponse.json({ error: "Report does not contain a message ID" }, { status: 400 });
        }
        break;

      case "block_user":
        if (report.reportedUserId) {
          await UserSchema.findByIdAndUpdate(report.reportedUserId, { status: "blocked" });
          actionTaken = "User Blocked";
          logAction = "USER_BLOCKED_VIA_REPORT";
        } else {
          return NextResponse.json({ error: "Report does not contain a user ID" }, { status: 400 });
        }
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const updatedReport = await ReportSchema.findByIdAndUpdate(
      reportId,
      { status: "resolved", actionTaken, adminId },
      { new: true }
    );

    await logAdminAction(adminId, logAction, `Report ID: ${reportId}`, { action, reportedMessageId: report.reportedMessageId, reportedUserId: report.reportedUserId });

    return NextResponse.json({ message: `Report resolved: ${actionTaken}`, report: updatedReport }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
