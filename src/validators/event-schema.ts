import { z } from "zod";

const validDate = (label: string) =>
  z
    .string()
    .or(z.date())
    .transform((val) => new Date(val))
    .refine((d) => !Number.isNaN(d.getTime()), `${label} không hợp lệ`);

export const eventCreateSchema = z
  .object({
    type: z.enum(["talkshow", "workshop", "job_fair", "other"]),
    title: z.string().min(5, "Tiêu đề sự kiện ít nhất 5 ký tự"),
    description: z.string().min(10, "Mô tả sự kiện ít nhất 10 ký tự"),
    format: z.enum(["online", "offline"]),
    locationOrLink: z.string().min(2, "Địa điểm hoặc đường link tham dự"),
    startTime: validDate("Thời gian bắt đầu"),
    endTime: validDate("Thời gian kết thúc"),
    capacity: z.coerce.number().int().positive().optional().nullable(),
    coverImageUrl: z.string().optional().nullable(),
    status: z.enum(["draft", "published"]).default("published"),
  })
  .refine((v) => v.endTime.getTime() > v.startTime.getTime(), {
    message: "Thời gian kết thúc phải sau thời gian bắt đầu",
    path: ["endTime"],
  });

export const speakerInviteSchema = z.object({
  eventId: z.string().uuid("ID sự kiện không hợp lệ"),
  alumniUserId: z.string().min(1, "Vui lòng chọn cựu sinh viên"),
  note: z.string().optional().nullable(),
});

export const speakerResponseSchema = z.object({
  status: z.enum(["accepted", "declined"]),
  note: z.string().optional().nullable(),
});

export const attendanceStatusSchema = z.enum([
  "attended",
  "absent",
  "registered",
]);

export type EventCreateInput = z.infer<typeof eventCreateSchema>;
export type SpeakerInviteInput = z.infer<typeof speakerInviteSchema>;
