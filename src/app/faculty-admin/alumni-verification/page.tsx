import * as React from "react";
import { getPendingAlumniVerifications } from "@/actions/profile-actions";
import { VerificationRowActions } from "./verification-row-actions";
import { ShieldCheck, UserCheck, Clock, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const dynamic = "force-dynamic";

const AlumniVerificationPage = async () => {
  let pendingList: any[] = [];
  try {
    pendingList = await getPendingAlumniVerifications();
  } catch (err) {
    console.error("Error fetching pending alumni:", err);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-[#1B7A3E]" />
            Hàng đợi xác thực Cựu sinh viên
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Đối chiếu MSSV, khóa học và phê duyệt cựu sinh viên tham gia mạng lưới DLU
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#1B7A3E] border border-emerald-200">
            {pendingList.length} hồ sơ chờ duyệt
          </span>
        </div>
      </div>

      {pendingList.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 p-12 text-center bg-white dark:bg-neutral-900">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-[#1B7A3E]">
            <UserCheck className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Không có hồ sơ nào chờ duyệt
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            Tất cả cựu sinh viên đăng ký đều đã được xác thực hoặc xử lý xong.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-950/50 text-xs font-semibold uppercase text-neutral-500">
                <tr>
                  <th className="px-6 py-4">Cựu sinh viên</th>
                  <th className="px-6 py-4">MSSV & Khóa</th>
                  <th className="px-6 py-4">Nơi làm việc hiện tại</th>
                  <th className="px-6 py-4">Thời gian đăng ký</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {pendingList.map((item) => {
                  const initials = item.fullName
                    ? item.fullName
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()
                    : "SV";

                  return (
                    <tr
                      key={item.userId}
                      className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-neutral-200">
                            <AvatarImage src={item.avatarUrl || undefined} />
                            <AvatarFallback className="bg-emerald-100 text-[#1B7A3E] font-medium text-xs">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                              {item.fullName}
                            </div>
                            <div className="text-xs text-neutral-500">
                              {item.email}
                            </div>
                            {item.phone && (
                              <div className="text-xs text-neutral-400">
                                SĐT: {item.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="inline-flex items-center gap-1 font-mono text-xs font-medium px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                            MSSV: {item.studentCode || "Chưa cung cấp"}
                          </div>
                          <div className="text-xs text-neutral-500">
                            Khóa: {item.batchYear ? `K${item.batchYear}` : "—"} • Tốt nghiệp: {item.graduationYear || "—"}
                          </div>
                          <div className="text-xs text-neutral-400">
                            Khoa: {item.faculty || "Khoa CNTT"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {item.currentCompanyName || item.currentTitle ? (
                          <div>
                            <div className="font-medium text-neutral-800 dark:text-neutral-200 text-xs">
                              {item.currentTitle || "Chức vụ chưa cập nhật"}
                            </div>
                            <div className="text-xs text-neutral-500">
                              {item.currentCompanyName}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-neutral-400 italic">Chưa cập nhật việc làm</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-neutral-500 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-neutral-400" />
                          {new Date(item.createdAt).toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </div>
                        {item.alumniRejectedReason && (
                          <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-600">
                            <AlertCircle className="h-3 w-3" />
                            Từng từ chối: {item.alumniRejectedReason}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <VerificationRowActions
                          userId={item.userId}
                          userName={item.fullName}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumniVerificationPage;
