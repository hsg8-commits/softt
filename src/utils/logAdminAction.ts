import LogSchema from "@/schemas/logSchema";

export async function logAdminAction(
  adminId: string,
  action: string,
  target: string,
  details: object = {}
) {
  try {
    const log = new LogSchema({
      adminId,
      action,
      target,
      details,
    });
    await log.save();
  } catch (error) {
    console.error("Error logging admin action:", error);
    // يمكن تجاهل الخطأ هنا لمنع توقف API بسبب فشل في التسجيل
  }
}
