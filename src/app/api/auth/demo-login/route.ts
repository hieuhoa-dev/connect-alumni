import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDemoAccount, DEMO_COOKIE_NAME } from "@/lib/demo-accounts";

export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    const { email } = body;

    const demoUser = getDemoAccount(email);
    if (!demoUser) {
      return NextResponse.json(
        { error: "Tài khoản không tồn tại trong danh sách tài khoản demo." },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    cookieStore.set(DEMO_COOKIE_NAME, demoUser.email, {
      httpOnly: true,
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return NextResponse.json({
      success: true,
      user: demoUser,
      redirectUrl: demoUser.redirectUrl,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Đã xảy ra lỗi đăng nhập demo" },
      { status: 500 },
    );
  }
};
