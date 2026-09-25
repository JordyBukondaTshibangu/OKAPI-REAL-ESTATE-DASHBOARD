"use client";

import { Eye, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { Button } from "@/components/ui/button";

import { Property } from "@/types";
import { PropertyDialogType } from "@/components/dashboard/main/_common/data-table/molecules/columns/property-column";

type PropertyRowActionsProps = {
  property: Property;
  currentPage: number;
  toggleDialog?: (key: PropertyDialogType, value: boolean) => void;
  setSelectedProperty?: (property: Property) => void;
  labelView?: string;
  labelDelete?: string;
};

export function PropertyRowActions({
  property,
  currentPage,
  toggleDialog,
  setSelectedProperty,
  labelView = "View",
  labelDelete = "Delete",
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
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" className="gap-1.5 h-8" onClick={handleView}>
        <Eye className="size-3.5" />
        {labelView}
      </Button>
      <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleDelete}>
        <Trash2 className="size-3.5" />
        {labelDelete}
      </Button>
    </div>
  );
}
