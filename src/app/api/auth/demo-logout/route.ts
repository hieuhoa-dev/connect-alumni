import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DEMO_COOKIE_NAME } from "@/lib/demo-accounts";

export const POST = async () => {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(DEMO_COOKIE_NAME);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Lỗi khi đăng xuất" },
      { status: 500 },
    );
  }
};
