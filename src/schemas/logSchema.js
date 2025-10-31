import mongoose, { Schema } from "mongoose";

export const schema = new Schema(
  {
    adminId: { type: Schema.ObjectId, ref: "Admin", required: true },
    action: { type: String, required: true }, // مثال: "DELETE_USER", "BLOCK_USER", "VIEW_MESSAGE"
    target: { type: String, required: true }, // مثال: "User ID 123", "Message ID 456"
    details: { type: Object }, // تفاصيل إضافية عن الإجراء
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const LogSchema = mongoose.models.Log || mongoose.model("Log", schema);
export default LogSchema;
