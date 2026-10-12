import type { Metadata } from "next";
import { LandingView } from "@/components/landing/landing-view";
import { getLandingData } from "@/lib/public-data";

export const metadata: Metadata = {
  title: "Connect Alumni · Cựu sinh viên CNTT Đại học Đà Lạt",
  description:
    "Kết nối sinh viên, cựu sinh viên và doanh nghiệp cùng Khoa Công nghệ Thông tin, Trường Đại học Đà Lạt. Khám phá chuyện nghề, sự kiện, việc làm và Quỹ Khuyến học.",
};

const HomePage = async () => {
  const data = await getLandingData();
  return <LandingView data={data} />;
};

export default HomePage;
