"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPublishedEvents,
  getMyEventsAndInvites,
  registerForEvent,
  inviteSpeaker,
  respondSpeakerInvitation,
  markAttendance,
} from "@/actions/event-actions";
import type { SpeakerInviteInput } from "@/validators/event-schema";
import { toast } from "@/components/ui/toast";

export const eventKeys = {
  all: ["events"] as const,
  published: () => [...eventKeys.all, "published"] as const,
  my: () => [...eventKeys.all, "my"] as const,
};

export const usePublishedEvents = () => {
  return useQuery({
    queryKey: eventKeys.published(),
    queryFn: () => getPublishedEvents(),
  });
};

export const useMyEvents = () => {
  return useQuery({
    queryKey: eventKeys.my(),
    queryFn: () => getMyEventsAndInvites(),
  });
};

export const useRegisterForEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => registerForEvent(eventId),
    onSuccess: () => {
      toast.add({
        type: "success",
        description: "Đăng ký tham gia sự kiện thành công!",
      });
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
    onError: (err: any) => {
      toast.add({
        type: "error",
        description: err?.message || "Không thể đăng ký tham gia sự kiện",
      });
    },
  });
};

export const useInviteSpeaker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SpeakerInviteInput) => inviteSpeaker(input),
    onSuccess: () => {
      toast.add({
        type: "success",
        description: "Đã gửi lời mời diễn giả thành công!",
      });
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
    onError: (err: any) => {
      toast.add({
        type: "error",
        description: err?.message || "Không thể gửi lời mời diễn giả",
      });
    },
  });
};

export const useRespondSpeakerInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      speakerId: string;
      status: "accepted" | "declined";
      note?: string;
    }) => respondSpeakerInvitation(data.speakerId, data.status, data.note),
    onSuccess: (_, variables) => {
      toast.add({
        type: "success",
        description:
          variables.status === "accepted"
            ? "Đã chấp nhận lời mời tham gia diễn giả!"
            : "Đã từ chối lời mời diễn giả",
      });
      queryClient.invalidateQueries({ queryKey: eventKeys.my() });
    },
    onError: (err: any) => {
      toast.add({
        type: "error",
        description: err?.message || "Lỗi khi phản hồi lời mời",
      });
    },
  });
};

export const useMarkAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      registrationId: string;
      status: "attended" | "absent" | "registered";
    }) => markAttendance(data.registrationId, data.status),
    onSuccess: () => {
      toast.add({
        type: "success",
        description: "Cập nhật điểm danh thành công!",
      });
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
    onError: (err: any) => {
      toast.add({
        type: "error",
        description: err?.message || "Lỗi khi cập nhật điểm danh",
      });
    },
  });
};
