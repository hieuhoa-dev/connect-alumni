"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface AnalyticsChartsProps {
  jobsByIndustry: { industry: string; count: number }[];
  applicationsByStatus: { status: string; count: number }[];
  batchAlumniStats: { batchYear: number | null; count: number }[];
  fundStats: {
    target: number;
    fulfilled: number;
    pledged: number;
  };
}

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export const AnalyticsCharts = ({
  jobsByIndustry,
  applicationsByStatus,
  batchAlumniStats,
  fundStats,
}: AnalyticsChartsProps) => {
  const fundData = [
    { name: "Đã thực thu", value: fundStats.fulfilled, fill: "#10b981" },
    { name: "Đang cam kết", value: fundStats.pledged, fill: "#f59e0b" },
    {
      name: "Còn thiếu",
      value: Math.max(0, fundStats.target - fundStats.fulfilled - fundStats.pledged),
      fill: "#6366f1",
    },
  ];

  const batchData = batchAlumniStats
    .filter((b) => b.batchYear)
    .sort((a, b) => (a.batchYear || 0) - (b.batchYear || 0))
    .map((b) => ({
      name: `K${(b.batchYear || 2020) % 100}`,
      count: b.count,
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Jobs by Industry Bar Chart */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold">Nhu cầu tuyển dụng theo Lĩnh vực</CardTitle>
          <CardDescription className="text-xs">
            Phân bổ số lượng tin tuyển dụng được đối tác đăng tải
          </CardDescription>
        </CardHeader>
        <CardContent className="h-64 pt-2">
          {jobsByIndustry.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
              Chưa có dữ liệu việc làm.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={jobsByIndustry} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="industry" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`${val} tin tuyển dụng`, "Số lượng"]}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* 2. Fund Distribution Pie Chart */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold">Cơ cấu Quỹ Khuyến học (VNĐ)</CardTitle>
          <CardDescription className="text-xs">
            Tiến độ tiếp nhận thực tế so với mục tiêu chiến dịch
          </CardDescription>
        </CardHeader>
        <CardContent className="h-64 pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="h-full w-full max-w-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fundData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {fundData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${Number(val).toLocaleString("vi-VN")} đ`, "Số tiền"]}
                  contentStyle={{ fontSize: 11, borderRadius: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500 shrink-0" />
              <span>Đã thực thu: <strong>{fundStats.fulfilled.toLocaleString("vi-VN")} đ</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-amber-500 shrink-0" />
              <span>Đang cam kết: <strong>{fundStats.pledged.toLocaleString("vi-VN")} đ</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-indigo-500 shrink-0" />
              <span>Mục tiêu đề ra: <strong>{fundStats.target.toLocaleString("vi-VN")} đ</strong></span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Alumni count by batch */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold">Mạng lưới Cựu sinh viên theo Niên khóa</CardTitle>
          <CardDescription className="text-xs">
            Số lượng cựu sinh viên kết nối tài khoản trên hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent className="h-64 pt-2">
          {batchData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
              Chưa có dữ liệu cựu sinh viên.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={batchData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`${val} cựu sinh viên`, "Số lượng"]}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* 4. Applications by Status */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold">Hồ sơ Học bổng theo Trạng thái</CardTitle>
          <CardDescription className="text-xs">
            Tổng hợp hồ sơ sinh viên nộp xin xét duyệt
          </CardDescription>
        </CardHeader>
        <CardContent className="h-64 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={applicationsByStatus.map((s) => ({
                status:
                  s.status === "approved"
                    ? "Đã duyệt"
                    : s.status === "reviewing"
                    ? "Đang chấm"
                    : s.status === "rejected"
                    ? "Từ chối"
                    : "Chờ duyệt",
                count: s.count,
              }))}
              margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis dataKey="status" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(val: any) => [`${val} hồ sơ`, "Số lượng"]}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
