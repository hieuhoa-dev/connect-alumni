import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventByIdForStaff } from "@/actions/event-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AttendanceControls } from "./attendance-controls";

const EventAttendancePage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const event = await getEventByIdForStaff(id);
  if (!event) notFound();
  const attended = event.registrations.filter((registration) => registration.attendanceStatus === "attended").length;

  return <div className="mx-auto flex max-w-5xl flex-col gap-6">
    <Button variant="ghost" render={<Link href="/faculty-admin/events" />} nativeButton={false} className="w-fit">Quay lại danh sách sự kiện</Button>
    <Card>
      <CardHeader><CardTitle>Danh sách tham dự và điểm danh</CardTitle><CardDescription>{event.title} · {event.registrations.length} đăng ký · {attended} có mặt</CardDescription></CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Sinh viên / Cựu sinh viên</TableHead><TableHead>Mã số sinh viên</TableHead><TableHead>Email</TableHead><TableHead>Điểm danh</TableHead></TableRow></TableHeader>
          <TableBody>{event.registrations.length ? event.registrations.map((registration) => {
            const name = registration.user?.profile?.fullName || registration.user?.name || "Người tham dự";
            return <TableRow key={registration.id}><TableCell>{name}</TableCell><TableCell>{registration.user?.profile?.studentCode || "Chưa cập nhật"}</TableCell><TableCell>{registration.user?.email || "Chưa cập nhật"}</TableCell><TableCell><AttendanceControls registrationId={registration.id} status={registration.attendanceStatus} participantName={name} /></TableCell></TableRow>;
          }) : <TableRow><TableCell colSpan={4} className="py-10 text-center">Chưa có người đăng ký tham dự.</TableCell></TableRow>}</TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>;
};

export default EventAttendancePage;
