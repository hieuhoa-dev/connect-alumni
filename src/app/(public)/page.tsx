import type { Metadata } from "next";
import { LandingView } from "@/components/landing/landing-view";
import { getLandingData } from "@/lib/public-data";

export const revalidate = 60; // ISR: làm mới dữ liệu mỗi 60 giây

export const metadata: Metadata = {
  title: "Bản tin Cựu sinh viên - Khoa CNTT",
  description:
    "Tin chia sẻ từ cựu sinh viên, sự kiện, việc làm đã kiểm duyệt và Quỹ Khuyến học của Khoa Công nghệ Thông tin.",
};

const HomePage = async () => {
  const data = await getLandingData();
  return <LandingView data={data} />;
};

export default HomePage;
