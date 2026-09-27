import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getFormById } from "@/actions/form-actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Clock, ShieldCheck } from "lucide-react";
import { SurveyFormRenderer } from "./form-renderer";

interface SurveyDetailPageProps {
  params: Promise<{ id: string }>;
}

const SurveyDetailPage = async ({ params }: SurveyDetailPageProps) => {
  const { id } = await params;
  const form = await getFormById(id);

  if (!form) {
    notFound();
  }

  const isExpired = form.deadline ? new Date(form.deadline) < new Date() : false;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href="/student/surveys"
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
            className: "gap-1.5 text-xs text-muted-foreground",
          })}
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách khảo sát
        </Link>
      </div>

      <Card className="shadow-sm border-primary/20">
        <CardHeader className="space-y-2 border-b border-border/60 pb-4">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="outline" className="text-xs uppercase font-semibold">
              {form.type}
            </Badge>
            {form.deadline && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Hạn chót: {new Date(form.deadline).toLocaleDateString("vi-VN")}
              </span>
            )}
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold">{form.title}</CardTitle>
          <CardDescription className="text-xs leading-relaxed">
            {form.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <SurveyFormRenderer form={form} isExpired={isExpired} />
        </CardContent>
      </Card>
    </div>
  );
};

export default SurveyDetailPage;
