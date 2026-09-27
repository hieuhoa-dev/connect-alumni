import { getFormsForFaculty } from "@/actions/form-actions";
import { CampaignForm } from "./campaign-form";

export const metadata = {
  title: "Tạo chiến dịch học bổng mới | Khoa CNTT",
};

const NewCampaignPage = async () => {
  const forms = await getFormsForFaculty();
  const availableForms = forms.map((f) => ({ id: f.id, title: f.title }));

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-5">
        <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">
          Khởi Tạo Chiến Dịch Học Bổng Mới
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kêu gọi đóng góp gây quỹ từ cựu sinh viên & doanh nghiệp đối tác, phân bổ học bổng tới sinh viên khoa.
        </p>
      </div>

      <CampaignForm availableForms={availableForms} />
    </div>
  );
};

export default NewCampaignPage;
