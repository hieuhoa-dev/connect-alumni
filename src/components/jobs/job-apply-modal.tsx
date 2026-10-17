"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ExternalLink,
  CheckCircle2,
  Send,
  Loader2,
  Mail,
  FileText,
  Building2,
  ShieldCheck,
} from "lucide-react";

interface JobApplyModalProps {
  jobId: string;
  jobTitle: string;
  companyName?: string;
  applyContact?: string;
}

export const JobApplyModal = ({
  jobId,
  jobTitle,
  companyName = "Đối tác Trường ĐH Đà Lạt",
  applyContact = "tuyendung@dlu-partner.vn",
}: JobApplyModalProps) => {
  const [open, setOpen] = React.useState(false);
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [studentCodeOrBatch, setStudentCodeOrBatch] = React.useState("");
  const [cvLink, setCvLink] = React.useState("");
  const [coverNote, setCoverNote] = React.useState("");

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 700);
  };

  const handleReset = () => {
    setIsSuccess(false);
    setOpen(false);
  };

  const isEmail = applyContact.includes("@");
  const mailtoHref = isEmail
    ? `mailto:${applyContact}?subject=${encodeURIComponent(
        `[DLU ALUMNI] Ứng tuyển vị trí ${jobTitle} - ${fullName || "Sinh viên DLU"}`,
      )}&body=${encodeURIComponent(
        `Kính gửi Bộ phận Tuyển dụng ${companyName},\n\nTôi biết đến vị trí ${jobTitle} thông qua Mạng lưới Cựu sinh viên & Hợp tác Doanh nghiệp Trường Đại học Đà Lạt.\n\nHọ và tên: ${fullName}\nMSSV/Khóa: ${studentCodeOrBatch}\nSĐT: ${phone}\nLink hồ sơ/CV: ${cvLink}\n\nLời nhắn:\n${coverNote}\n\nTrân trọng,`,
      )}`
    : applyContact;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="w-full font-medium cursor-pointer bg-[#1E4D2B] hover:bg-[#1E4D2B]/90 text-white shadow-xs">
            Nộp đơn ứng tuyển ngay
            <ExternalLink data-icon="inline-end" className="size-4 ml-1" />
          </Button>
        }
      />

      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2 text-[#1E4D2B] text-xs font-semibold">
            <Building2 className="size-3.5" />
            <span>{companyName}</span>
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">
            Ứng tuyển: {jobTitle}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Hồ sơ sẽ được gửi trực tiếp đến nhà tuyển dụng đối tác được xác thực bởi Trường Đại học Đà Lạt.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-6 text-center space-y-4">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-[#1E4D2B] dark:bg-emerald-950/50">
              <CheckCircle2 className="size-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-foreground">
                Nộp hồ sơ thành công!
              </h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                Hồ sơ ứng tuyển của bạn đã được ghi nhận và gửi đến bộ phận tuyển dụng của{" "}
                <strong className="text-foreground">{companyName}</strong>. Nhà tuyển dụng sẽ liên hệ bạn qua email hoặc số điện thoại.
              </p>
            </div>

            <div className="pt-2">
              <Button
                onClick={handleReset}
                className="w-full text-xs font-medium cursor-pointer bg-[#1E4D2B] hover:bg-[#1E4D2B]/90 text-white"
              >
                Hoàn tất & Đóng
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <Label htmlFor="apply-name" className="text-xs">
                Họ và tên ứng viên <span className="text-destructive">*</span>
              </Label>
              <Input
                id="apply-name"
                required
                placeholder="VD: Nguyễn Văn A"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label htmlFor="apply-email" className="text-xs">
                  Email liên hệ <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="apply-email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="apply-phone" className="text-xs">
                  Số điện thoại <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="apply-phone"
                  required
                  placeholder="09xx xxx xxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="apply-code" className="text-xs">
                MSSV / Khóa tốt nghiệp (DLU)
              </Label>
              <Input
                id="apply-code"
                placeholder="VD: 21110045 hoặc K42 Khoa CNTT"
                value={studentCodeOrBatch}
                onChange={(e) => setStudentCodeOrBatch(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="apply-cv" className="text-xs">
                Đường dẫn CV / Portfolio (Google Drive, LinkedIn, GitHub...) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="apply-cv"
                required
                type="url"
                placeholder="https://drive.google.com/... hoặc linkedin.com/in/..."
                value={cvLink}
                onChange={(e) => setCvLink(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="apply-note" className="text-xs">
                Thư ngỏ / Giới thiệu bản thân ngắn gọn
              </Label>
              <Textarea
                id="apply-note"
                rows={3}
                placeholder="Giới thiệu về kinh nghiệm, thế mạnh và mong muốn đóng góp cho công ty..."
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                className="text-xs leading-relaxed"
              />
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-xs font-medium cursor-pointer bg-[#1E4D2B] hover:bg-[#1E4D2B]/90 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin mr-1.5" />
                    Đang gửi hồ sơ...
                  </>
                ) : (
                  <>
                    <Send className="size-3.5 mr-1.5" />
                    Gửi hồ sơ ứng tuyển trực tuyến
                  </>
                )}
              </Button>

              <a
                href={mailtoHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 text-[11px] text-muted-foreground hover:text-foreground border border-border/70 hover:border-border rounded-lg transition-colors"
              >
                <Mail className="size-3" />
                Hoặc mở ứng dụng Email gửi trực tiếp tới {applyContact}
              </a>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
