"use client";

import * as React from "react";
import { MessageSquareQuote, CheckCircle, Send, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

interface PollOption {
  id: string;
  label: string;
  votes: number;
}

export const AlumniSurvey = () => {
  const [selectedOption, setSelectedOption] = React.useState<string | null>(null);
  const [hasVoted, setHasVoted] = React.useState(false);
  const [feedbackText, setFeedbackText] = React.useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = React.useState(false);

  const [options, setOptions] = React.useState<PollOption[]>([
    {
      id: "ai",
      label: "Kỹ năng làm chủ AI & Tích hợp LLM vào ứng dụng",
      votes: 142,
    },
    {
      id: "fundamentals",
      label: "Tư duy Thuật toán & Cấu trúc Dữ liệu vững chắc",
      votes: 198,
    },
    {
      id: "softskills",
      label: "Tiếng Anh chuyên ngành & Kỹ năng làm việc nhóm thực chiến",
      votes: 165,
    },
    {
      id: "cloud",
      label: "Kiến trúc Đám mây (Cloud Native) & Thực hành CI/CD DevOps",
      votes: 89,
    },
  ]);

  const totalVotes = React.useMemo(() => {
    return options.reduce((sum, opt) => sum + opt.votes, 0);
  }, [options]);

  const handleVote = () => {
    if (!selectedOption) {
      toast.error("Vui lòng chọn một phương án bình chọn.");
      return;
    }
    setOptions((prev) =>
      prev.map((opt) =>
        opt.id === selectedOption ? { ...opt, votes: opt.votes + 1 } : opt,
      ),
    );
    setHasVoted(true);
    toast.success("Cảm ơn bạn đã tham gia bình chọn khảo sát cựu sinh viên!");
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setIsSubmittingFeedback(true);
    setTimeout(() => {
      setIsSubmittingFeedback(false);
      setFeedbackText("");
      toast.success("Ý kiến đóng góp của bạn đã được gửi thành công đến Ban Chủ nhiệm Khoa.");
    }, 600);
  };

  return (
    <section id="survey" className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-10 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Context (như ảnh 3 UIT) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#CDE3CB]/60 bg-[#EDF3EC] px-3 py-1 text-xs font-mono font-semibold text-[#346538] dark:bg-emerald-950/40 dark:text-emerald-300">
              <MessageSquareQuote className="size-3.5" />
              <span>KHẢO SÁT CỰU SINH VIÊN KHOA CNTT</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-snug">
              Ý kiến của bạn là kim chỉ nam cải tiến chất lượng đào tạo
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Trân trọng kính mời Quý Anh/Chị Cựu sinh viên đang làm việc, giữ vị trí quản lý tại các doanh nghiệp tham gia khảo sát đóng góp ý kiến định kỳ cho Khoa CNTT.
            </p>

            <form onSubmit={handleFeedbackSubmit} className="space-y-3 pt-2">
              <label
                htmlFor="feedback-input"
                className="block text-xs font-semibold text-foreground"
              >
                Gửi góp ý trực tiếp đến Ban Chủ nhiệm Khoa:
              </label>
              <textarea
                id="feedback-input"
                rows={3}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Nhập đề xuất về môn học, công nghệ mới hoặc cơ hội hợp tác..."
                className="w-full text-xs p-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
              <Button
                type="submit"
                size="sm"
                disabled={isSubmittingFeedback || !feedbackText.trim()}
                className="text-xs"
              >
                <Send className="size-3 mr-1.5" />
                {isSubmittingFeedback ? "Đang gửi..." : "Gửi góp ý cho Khoa"}
              </Button>
            </form>
          </div>

          {/* Right Column: Interactive Quick Poll Widget */}
          <div className="lg:col-span-7 rounded-xl border border-border/80 bg-background/90 p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider font-bold text-foreground flex items-center gap-1.5">
                  <BarChart2 className="size-3.5 text-sky-600" />
                  THĂM DÒ NHANH TRỰC TUYẾN
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Kỹ năng quan trọng nhất sinh viên CNTT cần trang bị trước khi tốt nghiệp?
                </p>
              </div>
              <span className="font-mono text-[11px] text-muted-foreground shrink-0">
                {totalVotes} lượt phản hồi
              </span>
            </div>

            {/* Poll options list */}
            <div className="space-y-2.5 pt-1">
              {options.map((opt) => {
                const percent = Math.round((opt.votes / (totalVotes || 1)) * 100);
                const isSelected = selectedOption === opt.id;

                return (
                  <div
                    key={opt.id}
                    onClick={() => !hasVoted && setSelectedOption(opt.id)}
                    className={`relative p-3 rounded-lg border transition-all cursor-pointer overflow-hidden ${
                      isSelected
                        ? "border-foreground bg-muted/40"
                        : "border-border/70 hover:border-foreground/30 bg-card"
                    }`}
                  >
                    {/* Background Progress fill when voted */}
                    {hasVoted && (
                      <div
                        className="absolute inset-y-0 left-0 bg-muted/70 transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    )}

                    <div className="relative z-10 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 pr-2">
                        <span
                          className={`size-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "border-foreground bg-foreground text-background"
                              : "border-border"
                          }`}
                        >
                          {isSelected && <span className="size-1.5 bg-background rounded-full" />}
                        </span>
                        <span className="font-medium text-foreground leading-snug">
                          {opt.label}
                        </span>
                      </div>

                      {hasVoted && (
                        <span className="font-mono text-xs font-bold text-foreground shrink-0">
                          {percent}%
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Vote Action */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-muted-foreground font-mono">
                {hasVoted ? "Đã ghi nhận bình chọn của bạn" : "Chọn 1 phương án và xác nhận"}
              </span>
              <Button
                type="button"
                size="sm"
                onClick={handleVote}
                disabled={hasVoted || !selectedOption}
                className="text-xs"
              >
                {hasVoted ? "Đã bình chọn" : "Xác nhận bình chọn"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
