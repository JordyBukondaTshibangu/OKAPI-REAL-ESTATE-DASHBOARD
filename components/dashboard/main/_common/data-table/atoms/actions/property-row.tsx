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

import { Property } from "@/types";
import { PropertyDialogType } from "@/components/dashboard/main/_common/data-table/molecules/columns/property-column";

type PropertyRowActionsProps = {
  property: Property;
  currentPage: number;
  toggleDialog?: (key: PropertyDialogType, value: boolean) => void;
  setSelectedProperty?: (property: Property) => void;
};

export function PropertyRowActions({
  property,
  currentPage,
  toggleDialog,
  setSelectedProperty,
}: PropertyRowActionsProps) {
  const router = useRouter();

  const handleView = useCallback(() => {
    router.push(`/properties/${property.id}?queryPage=${currentPage}`);
  }, [property.id, currentPage, router]);

  const handleDelete = useCallback(() => {
    setSelectedProperty?.(property);
    toggleDialog?.("deleteProperty", true);
  }, [property, setSelectedProperty, toggleDialog]);

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
