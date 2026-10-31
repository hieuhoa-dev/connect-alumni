import * as React from "react";
import { getAdminHeroSlides } from "@/actions/hero-actions";
import { HeroManagementClient } from "./hero-management-client";

export const metadata = {
  title: "Quản lý Banner Trang chủ | Khoa CNTT - Trường ĐH Đà Lạt",
};

const HeroManagementPage = async () => {
  const slides = await getAdminHeroSlides();

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4 sm:px-6">
      <HeroManagementClient initialSlides={slides} />
    </div>
  );
};

export default HeroManagementPage;
