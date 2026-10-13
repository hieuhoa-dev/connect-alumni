import type { Metadata } from "next";
import { LandingView } from "@/components/landing/landing-view";
import { getLandingData } from "@/lib/public-data";

export const metadata: Metadata = {
  title: "DLU Alumni · Sinh viên và cựu sinh viên Đại học Đà Lạt",
  description:
    "Tin tức và hoạt động của cộng đồng sinh viên và cựu sinh viên Đại học Đà Lạt. Cùng DLU Alumni cập nhật sự kiện, chia sẻ chuyện nghề, tìm cơ hội việc làm và đồng hành cùng Quỹ Khuyến học.",
};

const HomePage = async ({
  searchParams,
}: {
  searchParams: Promise<{ search?: string | string[] }>;
}) => {
  const params = await searchParams;
  const keyword = Array.isArray(params.search)
    ? params.search[0]
    : params.search;
  const search = keyword?.trim().slice(0, 160) || undefined;
  const data = await getLandingData(search);
  return <LandingView data={data} search={search} />;
};

export default HomePage;
