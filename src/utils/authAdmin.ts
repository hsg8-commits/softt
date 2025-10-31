import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

interface AdminToken {
  id: string;
  username: string;
  role: "superadmin" | "moderator";
}

interface AuthResult {
  success: boolean;
  adminId?: string;
  role?: "superadmin" | "moderator";
  error?: string;
}

export async function authAdmin(
  request: NextRequest,
  requiredRoles: Array<"superadmin" | "moderator"> = ["superadmin", "moderator"]
): Promise<AuthResult> {
  try {
    const token = request.cookies.get("adminToken")?.value || "";
    if (!token) {
      return { success: false, error: "Unauthorized: No token provided" };
    }

    const decodedToken = jwt.verify(
      token,
      process.env.TOKEN_SECRET!
    ) as AdminToken;

    if (!decodedToken || !decodedToken.id || !decodedToken.role) {
      return { success: false, error: "Unauthorized: Invalid token" };
    }

    const adminRole = decodedToken.role;

    if (!requiredRoles.includes(adminRole)) {
      return { success: false, error: "Forbidden: Insufficient permissions" };
    }

    return { success: true, adminId: decodedToken.id, role: adminRole };
  } catch (error) {
    return { success: false, error: "Unauthorized: Token verification failed" };
  }
}
