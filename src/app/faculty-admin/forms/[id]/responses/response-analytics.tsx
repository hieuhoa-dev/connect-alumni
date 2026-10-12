"use client";

import {
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Users,
} from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { getFormResponsesAndAnalytics } from "@/actions/form-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ResponseAnalyticsProps {
  data: Awaited<ReturnType<typeof getFormResponsesAndAnalytics>>;
}

export const ResponseAnalytics = ({ data }: ResponseAnalyticsProps) => {
  const { form, totalResponses, analytics } = data;
  const [expandedResponse, setExpandedResponse] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedResponse(expandedResponse === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Metric summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Tổng số phản hồi
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-serif">
              {totalResponses}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Đã hoàn thành nộp câu trả lời
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Số lượng câu hỏi
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-serif">
              {form.questions.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Câu hỏi khảo sát trong mẫu
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Trạng thái biểu mẫu
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-serif capitalize">
              {form.status === "open"
                ? "Đang mở"
                : form.status === "closed"
                  ? "Đã đóng"
                  : "Bản nháp"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {form.deadline
                ? `Hạn chót: ${new Date(form.deadline).toLocaleDateString("vi-VN")}`
                : "Không giới hạn"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="charts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="charts" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Biểu đồ tổng hợp thống kê
          </TabsTrigger>
          <TabsTrigger value="responses" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Danh sách phản hồi cá nhân ({totalResponses})
          </TabsTrigger>
        </TabsList>

        {/* Charts & Analytics */}
        <TabsContent value="charts" className="space-y-6">
          {analytics.map((item, index) => (
            <Card key={item.questionId} className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                    Câu hỏi #{index + 1} • {item.questionType}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {item.totalAnswers} câu trả lời
                  </span>
                </div>
                <CardTitle className="text-base font-medium mt-1">
                  {item.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Single or Multi Choice Bar Chart */}
                {(item.questionType === "single_choice" ||
                  item.questionType === "multi_choice") &&
                  Array.isArray(item.summaryData) && (
                    <div className="space-y-4">
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={item.summaryData}
                            margin={{
                              top: 10,
                              right: 20,
                              left: 10,
                              bottom: 20,
                            }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              opacity={0.3}
                            />
                            <XAxis
                              dataKey="name"
                              tick={{ fontSize: 12 }}
                              interval={0}
                              tickLine={false}
                            />
                            <YAxis allowDecimals={false} tickLine={false} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "var(--card)",
                                borderColor: "var(--border)",
                                borderRadius: "8px",
                              }}
                            />
                            <Bar
                              dataKey="count"
                              name="Số lượng chọn"
                              fill="#3b82f6"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Distribution breakdown */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-2 border-t border-border">
                        {item.summaryData.map((d) => {
                          const pct =
                            item.totalAnswers > 0
                              ? ((d.count / item.totalAnswers) * 100).toFixed(1)
                              : "0";
                          return (
                            <div
                              key={d.name}
                              className="flex justify-between items-center bg-muted/30 px-3 py-1.5 rounded"
                            >
                              <span className="truncate pr-2 font-medium">
                                {d.name}
                              </span>
                              <span className="text-muted-foreground font-mono">
                                {d.count} ({pct}%)
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                {/* Scale Rating */}
                {item.questionType === "scale" &&
                  item.summaryData &&
                  !Array.isArray(item.summaryData) && (
                    <div className="flex items-center gap-6 py-4">
                      <div className="text-center p-6 bg-primary/5 rounded-xl border border-primary/20 min-w-[140px]">
                        <div className="text-4xl font-serif font-bold text-primary">
                          {item.summaryData.average}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Thang{" "}
                          {form.questions.find((q) => q.id === item.questionId)
                            ?.config?.min ?? 1}
                          {" – "}
                          {form.questions.find((q) => q.id === item.questionId)
                            ?.config?.max ?? 5}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          Điểm đánh giá trung bình
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Tổng hợp từ {item.summaryData.total} lượt đánh giá
                          phản hồi.
                        </p>
                      </div>
                    </div>
                  )}

                {/* Text responses preview */}
                {(item.questionType === "short_text" ||
                  item.questionType === "long_text") && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground italic mb-2">
                      Câu trả lời dạng văn bản tự do ({item.totalAnswers} câu
                      trả lời):
                    </p>
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                      {form.responses
                        .flatMap((r) => {
                          const answer = r.answers.find(
                            (a) => a.questionId === item.questionId,
                          );
                          return answer?.answerValue ? [answer] : [];
                        })
                        .slice(0, 10)
                        .map((a) => (
                          <div
                            key={a.id}
                            className="text-xs p-2.5 rounded bg-muted/40 border border-border"
                          >
                            {String(a.answerValue)}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Individual responses list */}
        <TabsContent value="responses" className="space-y-4">
          {form.responses.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-muted-foreground text-sm">
                Chưa có phản hồi nào được ghi nhận.
              </p>
            </Card>
          ) : (
            form.responses.map((resp, idx) => {
              const isExpanded = expandedResponse === resp.id;
              const respondentName =
                resp.respondent?.profile?.fullName || "Ẩn danh";
              const respondentEmail = resp.respondent?.email;

              return (
                <Card key={resp.id} className="border-border">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-auto w-full justify-between rounded-none p-4 text-left whitespace-normal"
                    aria-expanded={isExpanded}
                    aria-controls={`response-${resp.id}`}
                    onClick={() => toggleExpand(resp.id)}
                  >
                    <span className="flex items-center gap-3">
                      <span className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        #{idx + 1}
                      </span>
                      <span className="flex flex-col">
                        <span className="font-medium text-sm text-foreground">
                          {respondentName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {respondentEmail}
                        </span>
                      </span>
                    </span>

                    <span className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(resp.submittedAt).toLocaleString("vi-VN")}
                      </span>
                      <span
                        className="size-8 flex items-center justify-center"
                        aria-hidden="true"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </span>
                    </span>
                  </Button>

                  {isExpanded && (
                    <CardContent
                      id={`response-${resp.id}`}
                      className="pt-2 pb-5 border-t border-border mt-2 space-y-4"
                    >
                      {form.questions.map((q) => {
                        const ans = resp.answers.find(
                          (a) => a.questionId === q.id,
                        );
                        return (
                          <div key={q.id} className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground">
                              {q.label}
                            </p>
                            <div className="text-sm bg-muted/30 p-2.5 rounded border border-border">
                              {ans?.answerValue != null &&
                              ans.answerValue !== "" ? (
                                Array.isArray(ans.answerValue) ? (
                                  ans.answerValue.join(", ")
                                ) : (
                                  String(ans.answerValue)
                                )
                              ) : ans?.fileUrl ? (
                                <a
                                  href={ans.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-primary hover:underline text-xs"
                                >
                                  Xem tệp đính kèm
                                </a>
                              ) : (
                                <span className="text-muted-foreground italic text-xs">
                                  Không có câu trả lời
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  )}
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
