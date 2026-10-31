import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { db } from "../src/db";
import { user, uploadedFiles, heroSlides } from "../src/db/schema";
import { uploadFile } from "../src/lib/storage";
import { eq, asc } from "drizzle-orm";

interface BannerSeedConfig {
  filename: string;
  badge: string;
  title: string;
  highlightText: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  imageAlt: string;
}

const BANNER_SLIDES: BannerSeedConfig[] = [
  {
    filename: "img1-notext.jpg",
    badge: "TRƯỜNG ĐẠI HỌC ĐÀ LẠT · KHOA CNTT",
    title: "Mừng bạn trở về nhà!",
    highlightText: "Nơi hội tụ, tri ân và tiếp bước tương lai",
    description:
      "Mạng lưới gắn kết các thế hệ Cựu sinh viên, Giảng viên, Doanh nghiệp đối tác và Sinh viên dưới bóng thông xanh xứ ngàn hoa.",
    primaryLabel: "Đăng ký tham gia",
    primaryHref: "/register",
    secondaryLabel: "Cập nhật hồ sơ Cựu SV",
    secondaryHref: "/login",
    imageAlt: "Khuôn viên Trường Đại học Đà Lạt trong nắng sớm",
  },
  {
    filename: "img2-notext.jpg",
    badge: "ĐẠI HỘI CỰU SINH VIÊN 2026",
    title: "DLU Homecoming: 50 Năm Truyền Thống",
    highlightText: "Khẳng định bản lĩnh & Tri thức Đà Lạt",
    description:
      "Chuỗi sự kiện kỷ niệm chặng đường vẻ vang 1976–2026, giao lưu chuyên đề công nghệ và ngày hội kết nối thế hệ sinh viên DLU.",
    primaryLabel: "Xem lịch trình sự kiện",
    primaryHref: "/events",
    secondaryLabel: "Gương mặt tiêu biểu",
    secondaryHref: "/experiences",
    imageAlt: "Cựu sinh viên và sinh viên Đại học Đà Lạt gặp gỡ",
  },
  {
    filename: "img3-notext.jpg",
    badge: "SÀN TUYỂN DỤNG CHIẾN LƯỢC",
    title: "Kết Nối 50+ Tập Đoàn Công Nghệ",
    highlightText: "Cơ hội nghề nghiệp rộng mở",
    description:
      "Hàng trăm cơ hội việc làm thực tập, Fresher và Kỹ sư phần mềm từ các đối tác hàng đầu được xác thực chính quy bởi Nhà trường.",
    primaryLabel: "Khám phá việc làm",
    primaryHref: "/jobs",
    secondaryLabel: "Dành cho Doanh nghiệp",
    secondaryHref: "/employer/onboarding",
    imageAlt: "Môi trường làm việc công nghệ chuyên nghiệp",
  },
  {
    filename: "img4.jpg",
    badge: "QUỸ KHUYẾN HỌC & TÀI TRỢ DLU",
    title: "Tiếp Sức Sinh Viên Vượt Khó",
    highlightText: "Chung tay thắp sáng ước mơ",
    description:
      "Đóng góp của quý Cựu sinh viên và Doanh nghiệp là nguồn động viên to lớn để các em sinh viên vững tâm trên giảng đường.",
    primaryLabel: "Ủng hộ quỹ khuyến học",
    primaryHref: "/scholarships",
    secondaryLabel: "Nộp hồ sơ xin học bổng",
    secondaryHref: "/scholarships",
    imageAlt: "Trao học bổng cho sinh viên xuất sắc",
  },
  {
    filename: "img-5.jpg",
    badge: "KỶ NIỆM 50 NĂM TRUYỀN THỐNG DLU",
    title: "Vững Bước Tương Lai - Vươn Tầm Cao Mới",
    highlightText: "Tự hào 50 năm truyền thống trường Đại học Đà Lạt",
    description:
      "Hành trình nửa thế kỷ đào tạo nguồn nhân lực chất lượng cao, phụng sự cộng đồng và phát triển đất nước.",
    primaryLabel: "Khám phá thư viện ảnh",
    primaryHref: "/gallery",
    secondaryLabel: "Tin tức & Sự kiện",
    secondaryHref: "/events",
    imageAlt: "Kỷ niệm 50 năm thành lập Trường Đại học Đà Lạt",
  },
];

export async function seedHeroBanners() {
  console.log("🚀 Bắt đầu quá trình seed banner trang chủ...");

  // 1. Tìm tài khoản admin sở hữu
  const [adminUser] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, "admin@khoacntt.edu.vn"))
    .limit(1);

  if (!adminUser) {
    throw new Error("Không tìm thấy tài khoản admin@khoacntt.edu.vn để sở hữu banner.");
  }

  const bannerSourceDir = path.join(__dirname, "image-seed", "banner");
  const publicBannerDir = path.join(__dirname, "../public", "banner");
  if (!fs.existsSync(publicBannerDir)) {
    fs.mkdirSync(publicBannerDir, { recursive: true });
  }

  // 2. Dọn dẹp slide cũ (nếu có các slide test hoặc seed cũ)
  await db.delete(heroSlides);
  console.log("✓ Đã xóa dữ liệu slide banner cũ.");

  for (let idx = 0; idx < BANNER_SLIDES.length; idx++) {
    const config = BANNER_SLIDES[idx];
    const sourcePath = path.join(bannerSourceDir, config.filename);

    if (!fs.existsSync(sourcePath)) {
      console.warn(`⚠️ Không tìm thấy ảnh nguồn: ${sourcePath}`);
      continue;
    }

    console.log(`\n📸 Đang xử lý [${idx + 1}/${BANNER_SLIDES.length}]: ${config.filename}...`);
    const rawBuffer = fs.readFileSync(sourcePath);

    // Đồng bộ sang public/banner để có local fallback
    const publicDest = path.join(publicBannerDir, config.filename);
    fs.copyFileSync(sourcePath, publicDest);

    // Lấy metadata ảnh
    const imageInfo = sharp(rawBuffer);
    const metadata = await imageInfo.metadata();
    const fileUuid = randomUUID();
    const purpose = "hero_banner";
    const primaryKey = `uploads/${purpose}/${fileUuid}.jpg`;

    // Tạo variants WebP (thumb, md, lg)
    const variants: Record<string, { key: string; url: string; width: number; height: number }> = {};
    for (const vConfig of [
      { name: "thumb", width: 400 },
      { name: "md", width: 960 },
      { name: "lg", width: 1600 },
    ] as const) {
      const vBuffer = await sharp(rawBuffer)
        .rotate()
        .resize({ width: vConfig.width, withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();

      const vKey = `uploads/${purpose}/${fileUuid}-${vConfig.name}.webp`;
      const { url: vUrl } = await uploadFile({
        key: vKey,
        body: vBuffer,
        contentType: "image/webp",
      });

      variants[vConfig.name] = {
        key: vKey,
        url: vUrl,
        width: vConfig.width,
        height: 0,
      };
    }

    // Upload raw original to S3
    const { url: primaryUrl } = await uploadFile({
      key: primaryKey,
      body: rawBuffer,
      contentType: "image/jpeg",
    });

    // Tạo record uploaded_files
    const [savedFile] = await db
      .insert(uploadedFiles)
      .values({
        id: fileUuid,
        ownerId: adminUser.id,
        purpose: "hero_banner",
        visibility: "public",
        status: "ready",
        fileKey: primaryKey,
        fileUrl: primaryUrl,
        mimeType: "image/jpeg",
        sizeBytes: rawBuffer.length,
        width: metadata.width || 1920,
        height: metadata.height || 1080,
        variants,
      })
      .returning();

    // Tạo record hero_slides
    await db.insert(heroSlides).values({
      badge: config.badge,
      title: config.title,
      highlightText: config.highlightText,
      description: config.description,
      primaryLabel: config.primaryLabel,
      primaryHref: config.primaryHref,
      secondaryLabel: config.secondaryLabel,
      secondaryHref: config.secondaryHref,
      imageFileId: savedFile.id,
      imageAlt: config.imageAlt,
      overlayEnabled: true,
      sortOrder: idx,
      status: "published",
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
    });

    console.log(`✓ Đã tạo slide "${config.title}" thành công (ID: ${savedFile.id}).`);
  }

  console.log("\n🎉 Hoàn thành seed banner trang chủ thành công!");
}

if (require.main === module) {
  seedHeroBanners()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Lỗi khi seed banner:", err);
      process.exit(1);
    });
}
