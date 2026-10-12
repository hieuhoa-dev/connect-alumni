"use client";

import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMarkAttendance } from "@/hooks/use-events";

const attendanceItems = [
  { value: "registered", label: "Chưa điểm danh" },
  { value: "attended", label: "Có mặt" },
  { value: "absent", label: "Vắng mặt" },
] as const;

interface AttendanceControlsProps {
  registrationId: string;
  status: "registered" | "attended" | "absent";
  participantName: string;
}

export const AttendanceControls = ({ registrationId, status, participantName }: AttendanceControlsProps) => {
  const router = useRouter();
  const { mutateAsync: markAttendance, isPending } = useMarkAttendance();
  const handleChange = async (value: string | null) => {
    const selected = attendanceItems.find((item) => item.value === value);
    if (!selected || selected.value === status || isPending) return;
    try {
      await markAttendance({ registrationId, status: selected.value });
      router.refresh();
    } catch {
      // The mutation hook displays the server error without changing the current status.
    }
  };

  return <Select items={attendanceItems} value={status} onValueChange={(value) => { void handleChange(value); }} disabled={isPending}>
    <SelectTrigger aria-label={`Điểm danh ${participantName}`} className="w-40"><SelectValue /></SelectTrigger>
    <SelectContent><SelectGroup>{attendanceItems.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectGroup></SelectContent>
  </Select>;
};
