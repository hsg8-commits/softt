import mongoose from "mongoose";
import bcrypt from "bcrypt";
import AdminSchema from "./src/schemas/adminSchema.js";
import { config } from "dotenv";

// تحميل متغيرات البيئة من ملف .env.admin
config({ path: "./.env.admin" });

const {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  ADMIN_USERNAME,
  ADMIN_ROLE,
  MONGODB_URI,
} = process.env;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined in .env or .env.admin");
  process.exit(1);
}

if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_USERNAME || !ADMIN_ROLE) {
  console.error("Admin credentials are not fully defined in .env.admin");
  process.exit(1);
}

const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected for seeding.");

    // 1. تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // 2. التحقق مما إذا كان المشرف موجودًا بالفعل
    const existingAdmin = await AdminSchema.findOne({ email: ADMIN_EMAIL });

    if (existingAdmin) {
      console.log("SuperAdmin already exists. Updating password if necessary.");
      if (existingAdmin.password !== hashedPassword) {
        existingAdmin.password = hashedPassword;
        await existingAdmin.save();
        console.log("SuperAdmin password updated.");
      }
    } else {
      // 3. إنشاء حساب المشرف
      const newAdmin = new AdminSchema({
        username: ADMIN_USERNAME,
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: ADMIN_ROLE,
      });

      await newAdmin.save();
      console.log("SuperAdmin created successfully:");
      console.log(`Email: ${ADMIN_EMAIL}`);
      console.log(`Password: ${ADMIN_PASSWORD}`);
    }
  } catch (error) {
    console.error("Error during admin seeding:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
  }
};

seedAdmin();
