import mongoose, { Schema } from "mongoose";

export const schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["superadmin", "moderator"], default: "moderator" },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const AdminSchema = mongoose.models.Admin || mongoose.model("Admin", schema);
export default AdminSchema;
