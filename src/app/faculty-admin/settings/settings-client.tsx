"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { updateSiteSettingsAction, type UpdateSiteSettingsInput } from "@/actions/settings-actions";
import { type SiteSettingsDto } from "@/types/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Phone, Mail, Globe, MapPin, Share2, Sparkles, Loader2, Save } from "lucide-react";

export const SettingsClient = ({ initialSettings }: { initialSettings: SiteSettingsDto }) => {
  const router = useRouter();
  const [isSaving, setIsSaving] = React.useState(false);

  const [phone, setPhone] = React.useState(initialSettings.contactPhone || "");
  const [email, setEmail] = React.useState(initialSettings.contactEmail || "");
  const [website, setWebsite] = React.useState(initialSettings.websiteUrl || "");
  const [address, setAddress] = React.useState(initialSettings.address || "");
  const [mapUrl, setMapUrl] = React.useState(initialSettings.mapUrl || "");
  const [facebook, setFacebook] = React.useState(initialSettings.facebookUrl || "");
  const [youtube, setYoutube] = React.useState(initialSettings.youtubeUrl || "");
  const [zalo, setZalo] = React.useState(initialSettings.zaloUrl || "");

  const [aiSurvey, setAiSurvey] = React.useState(initialSettings.aiSurveySummaryEnabled ?? false);
  const [aiWriting, setAiWriting] = React.useState(initialSettings.aiWritingAssistantEnabled ?? false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload: UpdateSiteSettingsInput = {
        contactPhone: phone.trim() || null,
        contactEmail: email.trim() || null,
        websiteUrl: website.trim() || null,
        address: address.trim() || null,
        mapUrl: mapUrl.trim() || null,
        facebookUrl: facebook.trim() || null,
        youtubeUrl: youtube.trim() || null,
        zaloUrl: zalo.trim() || null,
        aiSurveySummaryEnabled: aiSurvey,
        aiWritingAssistantEnabled: aiWriting,
      };

      const res = await updateSiteSettingsAction(payload);
      if (res.success) {
        toast.success("Đã lưu thiết lập hệ thống thành công!");
        router.refresh();
      } else {
        toast.error(res.error || "Có lỗi xảy ra khi lưu thiết lập.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Thiết lập chung &amp; Thông tin liên hệ</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Các trường để trống sẽ tự động được ẩn khỏi chân trang và khối liên hệ công khai.
          </p>
        </div>
        <Button type="submit" disabled={isSaving} className="gap-2">
          {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          <span>Lưu thay đổi</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building className="size-4 text-emerald-600" />
              <span>Thông tin đơn vị &amp; Liên hệ</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Thông tin hiển thị tại thanh điều hướng, chân trang và mục liên hệ.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Số điện thoại liên hệ</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+84 263 3822 246"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Email chính thức</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="it@dlu.edu.vn"
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">Trang web Khoa / Trường</Label>
              <Input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://dlu.edu.vn"
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">Địa chỉ trụ sở</Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Tòa nhà A7, Số 01 Phù Đổng Thiên Vương, Phường 8, TP. Đà Lạt"
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">Liên kết bản đồ (Google Maps URL)</Label>
              <Input
                type="url"
                value={mapUrl}
                onChange={(e) => setMapUrl(e.target.value)}
                placeholder="https://maps.google.com/?q=..."
                className="text-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Links & Feature Flags */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Share2 className="size-4 text-emerald-600" />
                <span>Mạng xã hội &amp; Kênh truyền thông</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Để trống nếu đơn vị chưa kích hoạt kênh tương ứng.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Trang Facebook</Label>
                <Input
                  type="url"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="https://facebook.com/..."
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Kênh YouTube</Label>
                <Input
                  type="url"
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  placeholder="https://youtube.com/@..."
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Kênh Zalo Official</Label>
                <Input
                  type="url"
                  value={zalo}
                  onChange={(e) => setZalo(e.target.value)}
                  placeholder="https://zalo.me/..."
                  className="text-xs"
                />
              </div>
            </CardContent>
          </Card>

          {/* AI Flags Card (Default Off as required by Phase G principles) */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="size-4 text-amber-500" />
                <span>Tính năng Hỗ trợ AI (Giai đoạn G)</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Mặc định tắt. Chỉ bật khi có cấu hình API Key và nhà cung cấp hợp lệ.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ai-survey" className="text-xs font-semibold cursor-pointer">
                    Tóm tắt câu hỏi tự do trong Khảo sát bằng AI
                  </Label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Hỗ trợ tổng quan và phân loại chủ đề câu trả lời tự luận.
                  </p>
                </div>
                <Switch
                  id="ai-survey"
                  checked={aiSurvey}
                  onCheckedChange={setAiSurvey}
                />
              </div>

              <div className="flex items-center justify-between border-t pt-3">
                <div>
                  <Label htmlFor="ai-writing" className="text-xs font-semibold cursor-pointer">
                    Trợ lý viết bài chia sẻ &amp; Tin tuyển dụng
                  </Label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Gợi ý tiêu đề, sửa lỗi chính tả và hỗ trợ soạn thảo nhanh.
                  </p>
                </div>
                <Switch
                  id="ai-writing"
                  checked={aiWriting}
                  onCheckedChange={setAiWriting}
                />
              </div>
            </CardContent>
          </Card> */}
        </div>
      </div>
    </form>
  );
};
