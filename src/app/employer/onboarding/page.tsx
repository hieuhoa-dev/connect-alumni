"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { registerCompany } from "@/actions/company-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, Loader2, Send, CheckCircle2 } from "lucide-react";

const CompanyOnboardingPage = () => {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [industry, setIndustry] = React.useState("Công nghệ Thông tin / Phần mềm");
  const [website, setWebsite] = React.useState("");
  const [logoUrl, setLogoUrl] = React.useState("");
  const [roleInCompany, setRoleInCompany] = React.useState("Lead HR / Talent Acquisition");

  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await registerCompany({
        name,
        description,
        industry,
        website: website || undefined,
        logoUrl: logoUrl || null,
        roleInCompany,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/employer/dashboard");
      }, 2000);
    } catch (err: any) {
      setError(err?.message || "Có lỗi xảy ra khi đăng ký hồ sơ doanh nghiệp");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
            <Building2 className="h-4 w-4" />
            <span>Hồ sơ Đối tác Doanh nghiệp</span>
          </div>
          <CardTitle className="text-xl font-bold">Đăng ký thông tin Doanh nghiệp</CardTitle>
          <CardDescription className="text-xs">
            Hồ sơ doanh nghiệp sẽ được Khoa xác minh để đảm bảo uy tín và bảo vệ quyền lợi của sinh viên trước khi đăng tin tuyển dụng.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <Alert className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 py-6 text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 mx-auto" />
              <AlertDescription className="text-sm font-bold">
                Đăng ký hồ sơ doanh nghiệp thành công!
              </AlertDescription>
              <p className="text-xs text-muted-foreground">
                Khoa CNTT sẽ kiểm duyệt và xác minh hồ sơ của bạn sớm nhất. Đang chuyển hướng về Dashboard...
              </p>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="py-2 text-xs">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="cName" className="text-xs font-medium">Tên công ty / Doanh nghiệp</Label>
                <Input
                  id="cName"
                  placeholder="Ví dụ: Công ty Cổ phần Công nghệ ABC"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="industry" className="text-xs font-medium">Lĩnh vực hoạt động</Label>
                  <Input
                    id="industry"
                    placeholder="Phần mềm, Fintech, Game..."
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    required
                    disabled={isLoading}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="role" className="text-xs font-medium">Chức vụ của bạn tại công ty</Label>
                  <Input
                    id="role"
                    placeholder="HR Manager, Talent Lead..."
                    value={roleInCompany}
                    onChange={(e) => setRoleInCompany(e.target.value)}
                    required
                    disabled={isLoading}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="website" className="text-xs font-medium">Website chính thức</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://company.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    disabled={isLoading}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="logo" className="text-xs font-medium">Link Logo công ty</Label>
                  <Input
                    id="logo"
                    placeholder="https://images.unsplash.com/..."
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    disabled={isLoading}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="desc" className="text-xs font-medium">Giới thiệu về doanh nghiệp</Label>
                <Textarea
                  id="desc"
                  rows={5}
                  placeholder="Mô tả quy mô, sản phẩm chính, văn hóa làm việc và các chương trình thực tập/tuyển dụng..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  disabled={isLoading}
                  className="text-xs leading-relaxed"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" disabled={isLoading} className="gap-2 font-medium">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang gửi hồ sơ...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Gửi hồ sơ doanh nghiệp
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyOnboardingPage;
