import mongoose, { Schema } from "mongoose";

export const schema = new Schema(
  {
    key: { type: String, required: true, unique: true }, // مثال: "site_logo", "support_link", "feature_x_enabled"
    value: { type: Schema.Types.Mixed, required: true }, // يمكن أن يكون نص، رقم، بوليان، أو كائن
    description: { type: String },
    updatedBy: { type: Schema.ObjectId, ref: "Admin" },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const SettingSchema = mongoose.models.Setting || mongoose.model("Setting", schema);
export default SettingSchema;
