import { getFormsForFaculty } from "@/actions/form-actions";
import { CampaignForm } from "./campaign-form";

export const metadata = {
  title: "Tạo chiến dịch học bổng mới | DLU Alumni",
};

const NewCampaignPage = async () => {
  const forms = await getFormsForFaculty();
  const availableForms = forms
    .filter(
      (form) =>
        form.status === "open" &&
        (form.targetRole === "student" || form.targetRole === "all") &&
        (!form.deadline || form.deadline >= new Date()),
    )
    .map((f) => ({ id: f.id, title: f.title }));

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-5">
        <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">
          Khởi Tạo Chiến Dịch Học Bổng Mới
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kêu gọi đóng góp từ cựu sinh viên và doanh nghiệp, hỗ trợ sinh viên
          toàn trường đáp ứng điều kiện của chiến dịch.
        </p>
      </div>

      <CampaignForm availableForms={availableForms} />
    </div>
  );
};

export default NewCampaignPage;
