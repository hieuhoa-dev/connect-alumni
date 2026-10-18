"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { updateMyProfile, saveMyWorkExperience, deleteMyWorkExperience } from "@/actions/profile-actions";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import {
  User,
  Briefcase,
  Shield,
  History,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Building,
  Save,
  Loader2,
  Lock,
} from "lucide-react";

export const ProfileEditor = ({
  initialProfile,
  initialExperiences,
  initialRevisions,
  userEmail,
}: {
  initialProfile: any;
  initialExperiences: any[];
  initialRevisions: any[];
  userEmail: string;
}) => {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);

  // Profile basic & professional fields
  const [fullName, setFullName] = React.useState(initialProfile?.fullName || "");
  const [phone, setPhone] = React.useState(initialProfile?.phone || "");
  const [studentCode, setStudentCode] = React.useState(initialProfile?.studentCode || "");
  const [batchYear, setBatchYear] = React.useState(initialProfile?.batchYear ? String(initialProfile.batchYear) : "");
  const [graduationYear, setGraduationYear] = React.useState(initialProfile?.graduationYear ? String(initialProfile.graduationYear) : "");
  const [faculty, setFaculty] = React.useState(initialProfile?.faculty || "Công nghệ Thông tin");
  const [major, setMajor] = React.useState(initialProfile?.major || "");
  const [province, setProvince] = React.useState(initialProfile?.province || "");
  const [bio, setBio] = React.useState(initialProfile?.bio || "");
  const [avatarUrl, setAvatarUrl] = React.useState(initialProfile?.avatarUrl || "");
  const [skillsText, setSkillsText] = React.useState((initialProfile?.skills || []).join(", "));
  const [linkedinUrl, setLinkedinUrl] = React.useState(initialProfile?.linkedinUrl || "");
  const [githubUrl, setGithubUrl] = React.useState(initialProfile?.githubUrl || "");
  const [websiteUrl, setWebsiteUrl] = React.useState(initialProfile?.websiteUrl || "");

  // Privacy & Notifications
  const [visibility, setVisibility] = React.useState(initialProfile?.visibility || "members");
  const [showEmail, setShowEmail] = React.useState(!!initialProfile?.showEmail);
  const [showPhone, setShowPhone] = React.useState(!!initialProfile?.showPhone);
  const [emailNotifications, setEmailNotifications] = React.useState(
    initialProfile?.emailNotifications ?? true,
  );

  // Work experiences state
  const [experiences, setExperiences] = React.useState(initialExperiences);
  const [showExpModal, setShowExpModal] = React.useState(false);
  const [expTitle, setExpTitle] = React.useState("");
  const [expCompany, setExpCompany] = React.useState("");
  const [expIndustry, setExpIndustry] = React.useState("");
  const [expStartDate, setExpStartDate] = React.useState("");
  const [expEndDate, setExpEndDate] = React.useState("");
  const [expIsCurrent, setExpIsCurrent] = React.useState(true);
  const [expDesc, setExpDesc] = React.useState("");
  const [expLoading, setExpLoading] = React.useState(false);

  const isAlumniVerified = !!initialProfile?.alumniVerifiedAt;

  // Save main profile info
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const skillsArray = skillsText
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean)
        .slice(0, 20);

      await updateMyProfile({
        fullName,
        phone: phone || null,
        studentCode: studentCode || null,
        batchYear: batchYear ? Number(batchYear) : null,
        graduationYear: graduationYear ? Number(graduationYear) : null,
        faculty: faculty || null,
        major: major || null,
        province: province || null,
        bio: bio || null,
        avatarUrl: avatarUrl || null,
        skills: skillsArray,
        linkedinUrl: linkedinUrl || null,
        githubUrl: githubUrl || null,
        websiteUrl: websiteUrl || null,
        visibility,
        showEmail,
        showPhone,
        emailNotifications,
      });

      toast.success("Đã cập nhật hồ sơ thành công!");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Không thể cập nhật hồ sơ");
    } finally {
      setSaving(false);
    }
  };

  // Add work experience
  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle.trim() || !expCompany.trim() || !expStartDate) {
      toast.error("Vui lòng điền đủ chức vụ, công ty và ngày bắt đầu");
      return;
    }
    try {
      setExpLoading(true);
      const newExp = await saveMyWorkExperience({
        title: expTitle.trim(),
        companyName: expCompany.trim(),
        industry: expIndustry.trim() || null,
        startDate: expStartDate,
        endDate: expIsCurrent ? null : expEndDate || null,
        isCurrent: expIsCurrent,
        description: expDesc.trim() || null,
      });
      toast.success("Đã thêm kinh nghiệm làm việc");
      setExperiences([newExp, ...experiences]);
      setShowExpModal(false);
      // Reset form
      setExpTitle("");
      setExpCompany("");
      setExpIndustry("");
      setExpStartDate("");
      setExpEndDate("");
      setExpIsCurrent(true);
      setExpDesc("");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Không thể lưu kinh nghiệm");
    } finally {
      setExpLoading(false);
    }
  };

  const handleDeleteExperience = async (id: string) => {
    try {
      await deleteMyWorkExperience(id);
      setExperiences(experiences.filter((exp) => exp.id !== id));
      toast.success("Đã xóa kinh nghiệm");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Không thể xóa");
    }
  };

  return (
    <div className="space-y-6">
      {/* Verification status notice */}
      {initialProfile?.role === "alumni" && (
        <div className="p-4 rounded-xl border flex items-center justify-between gap-4 bg-white dark:bg-neutral-900">
          <div className="flex items-center gap-3">
            {isAlumniVerified ? (
              <div className="h-10 w-10 rounded-full bg-emerald-50 text-[#1B7A3E] flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            ) : (
              <div className="h-10 w-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Clock className="h-6 w-6" />
              </div>
            )}
            <div>
              <div className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                Trạng thái xác thực Cựu sinh viên:{" "}
                {isAlumniVerified ? (
                  <Badge className="bg-[#1B7A3E] text-white">Đã xác thực bởi Khoa</Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-700 border-amber-300">
                    Chờ Khoa xác thực
                  </Badge>
                )}
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                {isAlumniVerified
                  ? `Xác thực vào ngày ${new Date(initialProfile.alumniVerifiedAt).toLocaleDateString("vi-VN")}. Bạn đang hiển thị trên Danh bạ công khai.`
                  : "Hồ sơ của bạn đang được cán bộ Khoa CNTT đối chiếu. Bạn sẽ nhận thông báo khi được duyệt."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Form Tabs */}
      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-1 rounded-xl">
          <TabsTrigger value="basic" className="text-xs flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            Thông tin cơ bản
          </TabsTrigger>
          <TabsTrigger value="career" className="text-xs flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5" />
            Nghề nghiệp & Kinh nghiệm
          </TabsTrigger>
          <TabsTrigger value="privacy" className="text-xs flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            Quyền riêng tư
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs flex items-center gap-1.5">
            <History className="h-3.5 w-3.5" />
            Lịch sử cập nhật
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Basic Info */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Thông tin cá nhân & Đào tạo</CardTitle>
              <CardDescription className="text-xs">
                Cập nhật họ tên, ảnh đại diện, chuyên ngành và niên khóa tại ĐH Đà Lạt
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-6">
                {/* Avatar upload */}
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2 block">
                    Ảnh đại diện
                  </label>
                  <div className="max-w-xs">
                    <FileUpload
                      purpose="avatar"
                      accept="image/*"
                      value={avatarUrl}
                      onChange={(url) => setAvatarUrl(url)}
                      helperText="Tải ảnh chân dung (≤ 5MB)"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 block">
                      Họ và tên *
                    </label>
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 block">
                      Email đăng ký
                    </label>
                    <Input value={userEmail} disabled className="bg-neutral-50 dark:bg-neutral-800" />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 block flex items-center gap-1">
                      Mã số sinh viên (MSSV)
                      {isAlumniVerified && <Lock className="h-3 w-3 text-neutral-400" />}
                    </label>
                    <Input
                      value={studentCode}
                      onChange={(e) => setStudentCode(e.target.value)}
                      placeholder="VD: 2011234"
                      disabled={isAlumniVerified}
                    />
                    {isAlumniVerified && (
                      <span className="text-[11px] text-neutral-400">Đã khóa sau khi xác thực</span>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 block">
                      Số điện thoại
                    </label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0912 345 678"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 block flex items-center gap-1">
                      Khóa tuyển sinh
                      {isAlumniVerified && <Lock className="h-3 w-3 text-neutral-400" />}
                    </label>
                    <Input
                      type="number"
                      value={batchYear}
                      onChange={(e) => setBatchYear(e.target.value)}
                      placeholder="VD: 2020"
                      disabled={isAlumniVerified}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 block flex items-center gap-1">
                      Năm tốt nghiệp
                      {isAlumniVerified && <Lock className="h-3 w-3 text-neutral-400" />}
                    </label>
                    <Input
                      type="number"
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      placeholder="VD: 2024"
                      disabled={isAlumniVerified}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 block">
                      Khoa trực thuộc
                    </label>
                    <Input
                      value={faculty}
                      onChange={(e) => setFaculty(e.target.value)}
                      placeholder="Công nghệ Thông tin"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 block">
                      Chuyên ngành đào tạo
                    </label>
                    <Input
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      placeholder="Kỹ thuật Phần mềm / An toàn Thông tin..."
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 block">
                      Tỉnh / Thành phố hiện tại
                    </label>
                    <Input
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      placeholder="Lâm Đồng, TP.HCM, Đà Nẵng..."
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 block">
                      Kỹ năng chính (phân tách bằng dấu phẩy)
                    </label>
                    <Input
                      value={skillsText}
                      onChange={(e) => setSkillsText(e.target.value)}
                      placeholder="React, Next.js, AI, DevOps..."
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 block">
                    Tiểu sử ngắn gọn (Bio)
                  </label>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    placeholder="Giới thiệu về bản thân, định hướng công việc hoặc thông điệp kết nối..."
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-[#1B7A3E] hover:bg-[#156030] text-white text-xs px-5"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                    ) : (
                      <Save className="h-4 w-4 mr-1.5" />
                    )}
                    Lưu thông tin cá nhân
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Career & Work Experience */}
        <TabsContent value="career" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-semibold">Lịch sử công tác & Việc làm</CardTitle>
                <CardDescription className="text-xs">
                  Ghi nhận quá trình làm việc tại các cơ quan, doanh nghiệp đối tác
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => setShowExpModal(true)}
                className="bg-[#1B7A3E] hover:bg-[#156030] text-white text-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Thêm kinh nghiệm
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              {showExpModal && (
                <form
                  onSubmit={handleAddExperience}
                  className="mb-6 p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-4"
                >
                  <h4 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                    Thêm kinh nghiệm công tác mới
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1 block">
                        Chức danh / Vị trí *
                      </label>
                      <Input
                        value={expTitle}
                        onChange={(e) => setExpTitle(e.target.value)}
                        placeholder="Software Engineer, Team Lead..."
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1 block">
                        Tên công ty / Tổ chức *
                      </label>
                      <Input
                        value={expCompany}
                        onChange={(e) => setExpCompany(e.target.value)}
                        placeholder="FPT Software, VNG, Viettel..."
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1 block">
                        Lĩnh vực hoạt động
                      </label>
                      <Input
                        value={expIndustry}
                        onChange={(e) => setExpIndustry(e.target.value)}
                        placeholder="Công nghệ Thông tin, Tài chính..."
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1 block">
                        Ngày bắt đầu *
                      </label>
                      <Input
                        type="date"
                        value={expStartDate}
                        onChange={(e) => setExpStartDate(e.target.value)}
                        required
                      />
                    </div>
                    {!expIsCurrent && (
                      <div>
                        <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1 block">
                          Ngày kết thúc
                        </label>
                        <Input
                          type="date"
                          value={expEndDate}
                          onChange={(e) => setExpEndDate(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isCurrentExp"
                      checked={expIsCurrent}
                      onChange={(e) => setExpIsCurrent(e.target.checked)}
                      className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="isCurrentExp" className="text-xs text-neutral-700 dark:text-neutral-300">
                      Đây là công việc hiện tại của tôi (sẽ tự động đồng bộ vào thông tin danh bạ)
                    </label>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowExpModal(false)}
                      className="text-xs"
                    >
                      Hủy
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={expLoading}
                      className="bg-[#1B7A3E] hover:bg-[#156030] text-white text-xs"
                    >
                      {expLoading ? "Đang lưu..." : "Lưu kinh nghiệm"}
                    </Button>
                  </div>
                </form>
              )}

              {experiences.length === 0 ? (
                <div className="text-center py-8 text-neutral-400 text-xs">
                  Chưa có thông tin kinh nghiệm làm việc nào. Bấm &quot;Thêm kinh nghiệm&quot; để bổ sung.
                </div>
              ) : (
                <div className="space-y-3">
                  {experiences.map((exp) => (
                    <div
                      key={exp.id}
                      className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-start justify-between bg-white dark:bg-neutral-900"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600">
                          <Building className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                              {exp.title}
                            </h4>
                            {exp.isCurrent && (
                              <Badge className="bg-emerald-100 text-[#1B7A3E] text-[10px]">
                                Hiện tại
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mt-0.5">
                            {exp.companyName} {exp.industry ? `• ${exp.industry}` : ""}
                          </div>
                          <div className="text-xs text-neutral-400 mt-1">
                            {new Date(exp.startDate).toLocaleDateString("vi-VN", {
                              month: "2-digit",
                              year: "numeric",
                            })}{" "}
                            —{" "}
                            {exp.isCurrent
                              ? "Hiện nay"
                              : exp.endDate
                                ? new Date(exp.endDate).toLocaleDateString("vi-VN", {
                                    month: "2-digit",
                                    year: "numeric",
                                  })
                                : "—"}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteExperience(exp.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Privacy & Visibility */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Quyền riêng tư & Hiển thị</CardTitle>
              <CardDescription className="text-xs">
                Kiểm soát ai có thể nhìn thấy hồ sơ và phương thức liên hệ của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2 block">
                    Phạm vi hiển thị hồ sơ trên Danh bạ
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setVisibility("public")}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        visibility === "public"
                          ? "border-[#1B7A3E] bg-emerald-50/40 text-[#1B7A3E]"
                          : "border-neutral-200 hover:bg-neutral-50"
                      }`}
                    >
                      <div className="font-semibold text-xs">Công khai (Public)</div>
                      <div className="text-[11px] text-neutral-500 mt-1">
                        Mọi thành viên đã đăng nhập đều xem được hồ sơ
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setVisibility("members")}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        visibility === "members"
                          ? "border-[#1B7A3E] bg-emerald-50/40 text-[#1B7A3E]"
                          : "border-neutral-200 hover:bg-neutral-50"
                      }`}
                    >
                      <div className="font-semibold text-xs">Chỉ thành viên (Mặc định)</div>
                      <div className="text-[11px] text-neutral-500 mt-1">
                        Chỉ cựu SV & sinh viên đã xác thực xem được
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setVisibility("private")}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        visibility === "private"
                          ? "border-[#1B7A3E] bg-emerald-50/40 text-[#1B7A3E]"
                          : "border-neutral-200 hover:bg-neutral-50"
                      }`}
                    >
                      <div className="font-semibold text-xs">Ẩn danh bạ (Private)</div>
                      <div className="text-[11px] text-neutral-500 mt-1">
                        Ẩn khỏi danh bạ tìm kiếm, chỉ Khoa xem được
                      </div>
                    </button>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                        Hiển thị Email trên hồ sơ
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        Cho phép các thành viên khác nhìn thấy email để liên hệ
                      </div>
                    </div>
                    <Switch checked={showEmail} onCheckedChange={setShowEmail} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                        Hiển thị Số điện thoại
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        Cho phép các thành viên khác nhìn thấy số điện thoại của bạn
                      </div>
                    </div>
                    <Switch checked={showPhone} onCheckedChange={setShowPhone} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                        Nhận thông báo qua Email
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        Nhận email khi có tin tuyển dụng, sự kiện hoặc lời mời kết nối mới
                      </div>
                    </div>
                    <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-[#1B7A3E] hover:bg-[#156030] text-white text-xs px-5"
                  >
                    {saving ? "Đang lưu..." : "Lưu thiết lập quyền riêng tư"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Revision History */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Lịch sử cập nhật hồ sơ</CardTitle>
              <CardDescription className="text-xs">
                Toàn bộ các lần thay đổi thông tin được ghi nhận tự động vào cơ sở dữ liệu
              </CardDescription>
            </CardHeader>
            <CardContent>
              {initialRevisions.length === 0 ? (
                <div className="text-center py-8 text-neutral-400 text-xs">
                  Chưa có lịch sử cập nhật nào được ghi lại.
                </div>
              ) : (
                <div className="space-y-3">
                  {initialRevisions.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 text-xs bg-neutral-50/50 dark:bg-neutral-900"
                    >
                      <div className="flex items-center justify-between text-neutral-500 text-[11px]">
                        <span>
                          Thời gian: {new Date(rev.createdAt).toLocaleString("vi-VN")}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          Nguồn: {rev.source}
                        </Badge>
                      </div>
                      <div className="mt-2 text-neutral-700 dark:text-neutral-300 font-mono text-[11px]">
                        Các trường thay đổi: {Object.keys(rev.changes || {}).join(", ")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
