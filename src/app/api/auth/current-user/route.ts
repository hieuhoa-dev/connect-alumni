import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/permissions";

export const GET = async () => {
  try {
    const current = await getCurrentUser();
    return NextResponse.json({
      user: current?.user || null,
      profile: current?.profile || null,
      role: current?.role || null,
    });
  } catch (err: any) {
    return NextResponse.json({ user: null, profile: null, role: null });
  }
};
