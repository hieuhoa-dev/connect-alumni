import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/permissions";
import { getAlumniDirectory } from "@/server/dal/alumni";
import { alumniSearchFilterSchema } from "@/validators/profile-schema";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const current = await getCurrentUser();
    if (!current?.user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để xem danh bạ cựu sinh viên." },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const rawParams = {
      search: searchParams.get("search") || undefined,
      batchYear: searchParams.get("batchYear") || undefined,
      major: searchParams.get("major") || undefined,
      province: searchParams.get("province") || undefined,
      industry: searchParams.get("industry") || undefined,
      employmentStatus: searchParams.get("employmentStatus") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
    };

    const parsed = alumniSearchFilterSchema.safeParse(rawParams);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Tham số không hợp lệ" },
        { status: 400 },
      );
    }

    const result = await getAlumniDirectory({
      ...parsed.data,
      viewerRole: current.role || undefined,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API /api/v1/alumni error:", error);
    return NextResponse.json(
      { error: "Không thể tải danh bạ cựu sinh viên." },
      { status: 500 },
    );
  }
}
