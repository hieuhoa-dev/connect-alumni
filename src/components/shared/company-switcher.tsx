"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { switchActiveCompany } from "@/actions/company-actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "cn";
import { Building2, Check, ChevronsUpDown, PlusCircle } from "lucide-react";
import Link from "next/link";

interface CompanyItem {
  id: string;
  name: string;
  membershipRole: string;
  isActiveContext: boolean;
}

interface CompanySwitcherProps {
  companies: CompanyItem[];
}

export const CompanySwitcher = ({ companies }: CompanySwitcherProps) => {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const activeCompany = companies.find((c) => c.isActiveContext) || companies[0];

  const handleSelect = (companyId: string) => {
    startTransition(async () => {
      await switchActiveCompany(companyId);
      router.refresh();
    });
  };

  if (!companies || companies.length === 0) {
    return (
      <Link
        href="/employer/onboarding"
        className={buttonVariants({ variant: "outline", size: "sm", className: "gap-2 text-xs" })}
      >
        <PlusCircle className="h-4 w-4" />
        Đăng ký doanh nghiệp
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "w-[200px] sm:w-[240px] justify-between text-left text-xs font-normal cursor-pointer",
        )}
      >
        <div className="flex items-center gap-2 truncate">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
            <Building2 className="h-3.5 w-3.5" />
          </div>
          <span className="truncate font-medium text-foreground">
            {activeCompany?.name || "Chọn doanh nghiệp"}
          </span>
        </div>
        <ChevronsUpDown className="ml-auto h-3.5 w-3.5 shrink-0 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[240px]" align="start">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Doanh nghiệp đang quản lý
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        {companies.map((company) => {
          const isSelected = activeCompany?.id === company.id;
          return (
            <DropdownMenuItem
              key={company.id}
              onClick={() => handleSelect(company.id)}
              className="flex items-center justify-between text-xs cursor-pointer"
            >
              <div className="flex flex-col truncate pr-2">
                <span className={`truncate font-medium ${isSelected ? "text-primary" : ""}`}>
                  {company.name}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {company.membershipRole}
                </span>
              </div>
              {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => router.push("/employer/onboarding")}
          className="flex items-center gap-2 text-xs cursor-pointer"
        >
          <PlusCircle className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Thêm doanh nghiệp mới</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
