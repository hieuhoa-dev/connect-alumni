import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/permissions";
import { CompleteProfileClient } from "./complete-profile-client";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ next?: string }>;
}

const CompleteProfilePage = async ({ searchParams }: PageProps) => {
  const current = await getCurrentUser();
  const { next } = await searchParams;

  if (!current?.user) {
    redirect(`/login?next=${encodeURIComponent(next || "/student/dashboard")}`);
  }

  if (current.profile) {
    redirect(next && next.startsWith("/") ? next : "/student/dashboard");
  }

  return (
    <CompleteProfileClient
      user={{
        name: current.user.name,
        email: current.user.email,
        image: current.user.image,
      }}
      nextUrl={next}
    />
  );
};

export default CompleteProfilePage;
