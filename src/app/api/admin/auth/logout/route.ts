import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const response = NextResponse.json({
      message: "Logout successful",
      success: true,
    });

    response.cookies.set("adminToken", "", {
      httpOnly: true,
      maxAge: 0,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
