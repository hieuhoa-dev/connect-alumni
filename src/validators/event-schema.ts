import { z } from "zod";

export const eventCreateSchema = z.object({
  type: z.enum(["talkshow", "workshop", "job_fair", "other"]),
  title: z.string().min(5, "Tiêu đề sự kiện ít nhất 5 ký tự"),
  description: z.string().min(10, "Mô tả sự kiện ít nhất 10 ký tự"),
  format: z.enum(["online", "offline"]),
  locationOrLink: z.string().min(2, "Địa điểm hoặc đường link tham dự"),
  startTime: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val)),
  endTime: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val)),
  capacity: z.coerce.number().int().positive().optional().nullable(),
  coverImageUrl: z.string().optional().nullable(),
  status: z.enum(["draft", "published"]).default("published"),
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

export type EventCreateInput = z.infer<typeof eventCreateSchema>;
export type SpeakerInviteInput = z.infer<typeof speakerInviteSchema>;
