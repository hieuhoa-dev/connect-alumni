"use client";

import { Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import type { getFormById } from "@/actions/form-actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useApplyScholarship } from "@/hooks/use-scholarships";
import { SurveyFormRenderer } from "../../../surveys/[id]/form-renderer";

interface ScholarshipApplyFormProps {
  campaignId: string;
  isExpired: boolean;
  studentName: string;
  studentCode: string;
  applicationForm: Awaited<ReturnType<typeof getFormById>> | null;
  requiresApplicationForm: boolean;
}

export const ScholarshipApplyForm = ({
  campaignId,
  isExpired,
  studentName,
  studentCode,
  applicationForm,
  requiresApplicationForm,
}: ScholarshipApplyFormProps) => {
  const router = useRouter();
  const {
    mutateAsync: apply,
    isPending,
    isSuccess,
    error,
  } = useApplyScholarship();
  const existingResponse = applicationForm?.responses[0];
  const submitApplication = async (formResponseId?: string) => {
    await apply({ campaignId, formResponseId });
  };

  if (isExpired)
    return (
      <Alert>
        <AlertDescription>
          Chiến dịch học bổng này đã kết thúc nhận hồ sơ.
        </AlertDescription>
      </Alert>
    );
  if (requiresApplicationForm && !applicationForm)
    return (
      <Alert>
        <AlertDescription>
          Biểu mẫu hồ sơ hiện chưa khả dụng cho tài khoản của bạn. Vui lòng liên
          hệ Ban quản trị để được hướng dẫn.
        </AlertDescription>
      </Alert>
    );
  if (isSuccess)
    return (
      <Alert>
        <AlertDescription>
          Hồ sơ của bạn đã được nộp thành công.
        </AlertDescription>
        <Button
          variant="outline"
          onClick={() => {
            router.push("/student/scholarships");
            router.refresh();
          }}
        >
          Quay lại danh sách học bổng
        </Button>
      </Alert>
    );

  return (
    <div className="flex flex-col gap-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="applicant-name">Họ tên sinh viên</FieldLabel>
          <Input id="applicant-name" value={studentName} readOnly />
        </Field>
        <Field>
          <FieldLabel htmlFor="applicant-code">Mã số sinh viên</FieldLabel>
          <Input
            id="applicant-code"
            value={studentCode || "Chưa cập nhật"}
            readOnly
          />
        </Field>
      </FieldGroup>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error.message || "Có lỗi xảy ra khi nộp hồ sơ"}
          </AlertDescription>
        </Alert>
      )}
      {applicationForm && !existingResponse ? (
        <SurveyFormRenderer
          form={applicationForm}
          isExpired={
            applicationForm.status !== "open" ||
            !!(
              applicationForm.deadline &&
              new Date(applicationForm.deadline) < new Date()
            )
          }
          onSubmitted={submitApplication}
          submitLabel="Nộp hồ sơ học bổng"
          redirectTo="/student/scholarships"
        />
      ) : (
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!isPending)
              void submitApplication(existingResponse?.id).catch(
                () => undefined,
              );
          }}
        >
          <p className="text-sm text-muted-foreground">
            {existingResponse
              ? "Hồ sơ sẽ sử dụng câu trả lời bạn đã gửi cho biểu mẫu của chiến dịch."
              : "Chiến dịch nhận đăng ký xét học bổng từ thông tin hồ sơ sinh viên của bạn."}
          </p>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            ) : (
              <Send data-icon="inline-start" />
            )}
            Xác nhận nộp hồ sơ
          </Button>
        </form>
      )}
    </div>
  );
};
