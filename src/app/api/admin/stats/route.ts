import { NextResponse } from "next/server";
import UserSchema from "@/schemas/userSchema";
import MessageSchema from "@/schemas/messageSchema";
import { connectDB } from "@/db";
import { authAdmin } from "@/utils/authAdmin";

connectDB();

// GET: جلب الإحصائيات العامة
export async function GET(request: Request) {
  try {
    const authResult = await authAdmin(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    // 1. إجمالي عدد المستخدمين
    const totalUsers = await UserSchema.countDocuments({});

    // 2. المستخدمين النشطين (افتراض: آخر ظهور خلال 15 دقيقة)
    const activeUsers = await UserSchema.countDocuments({
      status: "online", // أو يمكن استخدام حقل updatedAt إذا كان يتم تحديثه عند النشاط
    });

    // 3. الرسائل اليومية (افتراض: الرسائل التي تم إنشاؤها في آخر 24 ساعة)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const dailyMessages = await MessageSchema.countDocuments({
      createdAt: { $gte: oneDayAgo },
    });

    // 4. البلاغات المفتوحة
    const openReports = await ReportSchema.countDocuments({ status: "open" });

    // 5. التخزين المستخدم (هذا يتطلب منطق أكثر تعقيدًا لحساب حجم الملفات المرفوعة، سنقوم بوضع قيمة وهمية مؤقتًا)
    const storageUsedGB = 0.5; // 500 MB (قيمة وهمية)

    // 6. أكثر المستخدمين نشاطًا (آخر 7 أيام - يتطلب aggregation)
    // هذا الجزء معقد ويتطلب وقتًا، سنقوم بتبسيطه مؤقتًا
    const mostActiveUsers = await UserSchema.find({})
      .sort({ updatedAt: -1 }) // ترتيب حسب آخر تحديث كدلالة على النشاط
      .limit(5)
      .select("username name phone avatar");

    const stats = {
      totalUsers,
      activeUsers,
      dailyMessages,
      openReports,
      storageUsedGB,
      mostActiveUsers,
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
