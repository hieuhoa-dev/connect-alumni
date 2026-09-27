import { FormBuilder } from "./form-builder";

export const metadata = {
  title: "Tạo biểu mẫu mới | Khoa CNTT",
};

const NewFormPage = () => {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-5">
        <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">
          Tạo Biểu Mẫu / Khảo Sát Mới
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Thiết kế biểu mẫu khảo sát động, hồ sơ đăng ký học bổng hoặc thu thập
          ý kiến đóng góp từ sinh viên & cựu sinh viên.
        </p>
      </div>

      <FormBuilder />
    </div>
  );
};

export default NewFormPage;
