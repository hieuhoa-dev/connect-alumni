import { Inbox } from "lucide-react";
import { getContactMessages } from "@/actions/contact-actions";
import { EmptyBlock, Tag } from "@/components/landing/landing-parts";
import { formatDateVi, formatTimeVi } from "@/lib/text";
import { ContactRowActions } from "./contact-row-actions";

const FacultyContactPage = async () => {
  const messages = await getContactMessages();
  const unread = messages.filter((m) => !m.isRead).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-3xl font-normal tracking-tight text-foreground">
          Tin nhắn liên hệ
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {messages.length} tin nhắn, {unread} chưa đọc. Tin chưa đọc hiển thị
          trước.
        </p>
      </div>

      {messages.length === 0 ? (
        <EmptyBlock
          icon={Inbox}
          title="Chưa có tin nhắn nào"
          description="Tin nhắn gửi từ trang Liên hệ công khai sẽ xuất hiện tại đây."
        />
      ) : (
        <ul className="flex flex-col divide-y divide-border-strong rounded-xl border border-border-strong">
          {messages.map((m) => (
            <li
              key={m.id}
              className="flex flex-col gap-3 p-5 md:flex-row md:items-start md:justify-between"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  {!m.isRead && <Tag tone="blue">Mới</Tag>}
                  <h2 className="font-serif text-lg font-medium text-foreground">
                    {m.subject}
                  </h2>
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{m.name}</span>
                  {" · "}
                  {m.email}
                  {m.phone ? ` · ${m.phone}` : ""}
                  {" · "}
                  <time className="font-mono">
                    {formatDateVi(m.createdAt)} {formatTimeVi(m.createdAt)}
                  </time>
                </p>
                <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                  {m.message}
                </p>
              </div>
              <ContactRowActions
                id={m.id}
                isRead={m.isRead}
                email={m.email}
                subject={m.subject}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FacultyContactPage;
