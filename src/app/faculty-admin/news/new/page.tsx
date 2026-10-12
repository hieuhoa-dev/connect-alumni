import { NewsForm } from "@/components/news/news-form";

const NewNewsPage = () => {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="font-serif text-3xl font-normal tracking-tight text-foreground">
          Viết tin mới
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tin của Khoa hiển thị ở trang chủ và mục Tin tức. Bạn có thể lưu nháp
          trước khi đăng.
        </p>
      </div>
      <NewsForm />
    </div>
  );
};

export default NewNewsPage;
