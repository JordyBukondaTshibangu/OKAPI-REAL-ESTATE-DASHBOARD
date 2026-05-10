"use client";

import { MoreVertical, PenLine, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Agency } from "@/types";
import { AgencyDialogType } from "@/components/dashboard/main/_common/data-table/molecules/columns/agency-column";

type AgencyRowActionsProps = {
  agency: Agency;
  currentPage: number;
  toggleDialog?: (key: AgencyDialogType, value: boolean) => void;
  setSelectedAgency?: (agency: Agency) => void;
};

export function AgencyRowActions({
  agency,
  currentPage,
  toggleDialog,
  setSelectedAgency,
}: AgencyRowActionsProps) {
  const router = useRouter();

  const handleView = useCallback(() => {
    router.push(`/agencies/${agency.id}?queryPage=${currentPage}`);
  }, [agency.id, currentPage, router]);

  const handleDelete = useCallback(() => {
    setSelectedAgency?.(agency);
    toggleDialog?.("deleteAgency", true);
  }, [agency, setSelectedAgency, toggleDialog]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" className="h-8 w-8 p-0" aria-label="More options">
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-40 mr-10" align="start">
        <DropdownMenuItem onClick={handleView} className="cursor-pointer">
          <PenLine className="size-4" />
          View details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDelete}
          className="text-destructive hover:text-destructive cursor-pointer"
        >
          <Trash2 className="size-4 text-destructive" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
