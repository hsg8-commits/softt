import mongoose, { Schema } from "mongoose";

export const schema = new Schema(
  {
    reporterId: { type: Schema.ObjectId, ref: "User", required: true },
    reportedUserId: { type: Schema.ObjectId, ref: "User" }, // المستخدم المبلغ عنه
    reportedMessageId: { type: Schema.ObjectId, ref: "Message" }, // الرسالة المبلغ عنها
    reportType: { type: String, required: true }, // مثال: "Spam", "Harassment", "Inappropriate Content"
    content: { type: String, required: true }, // وصف البلاغ
    status: { type: String, enum: ["open", "in_review", "resolved", "ignored"], default: "open" },
    actionTaken: { type: String }, // الإجراء المتخذ: "User Blocked", "Message Deleted", "Ignored"
    adminId: { type: Schema.ObjectId, ref: "Admin" }, // المشرف الذي اتخذ الإجراء
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const ReportSchema = mongoose.models.Report || mongoose.model("Report", schema);
export default ReportSchema;
