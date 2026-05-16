"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bath, BedDouble, Home, Maximize2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TablePagination } from "./table-pagination";
import { useProperties } from "@/lib/queries/properties";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 5;

const LISTING_COLORS: Record<string, string> = {
  sale:       "bg-emerald-100 text-emerald-700 border-emerald-200",
  rent:       "bg-blue-100   text-blue-700   border-blue-200",
  commercial: "bg-purple-100 text-purple-700 border-purple-200",
};

type Props = {
  agentId?: string;
  agencyId?: string;
};

export default function DetailPropertiesList({ agentId, agencyId }: Props) {
  const router = useRouter();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useProperties({
    page,
    pageSize: PAGE_SIZE,
    agentId,
    agencyId,
  });

  const properties = data?.data ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <Card className="card-luxury">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Home className="size-4 text-brand-blue" />
          Properties
          {totalCount > 0 && (
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              {totalCount} total
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex flex-col divide-y">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-6 py-4 flex gap-3">
                <div className="h-4 w-16 rounded bg-muted animate-pulse" />
                <div className="flex-1 h-4 rounded bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">
            No properties found.
          </p>
        ) : (
          <>
            <div className="flex flex-col divide-y">
              {properties.map((property) => (
                <button
                  key={property.id}
                  type="button"
                  onClick={() => router.push(`/properties/${property.id}`)}
                  className="w-full text-left px-6 py-4 hover:bg-muted/40 transition-colors flex items-start gap-4"
                >
                  {/* Gradient swatch */}
                  <div
                    className={cn(
                      "shrink-0 w-10 h-10 rounded-lg bg-linear-to-br",
                      property.imageGradient || "from-gray-400 to-gray-600",
                    )}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-medium text-foreground truncate">
                        {property.title}
                      </span>
                      <span
                        className={cn(
                          "inline-flex shrink-0 items-center px-1.5 py-0.5 rounded border text-[10px] font-semibold capitalize",
                          LISTING_COLORS[property.listingType] ?? "bg-muted text-muted-foreground border-border",
                        )}
                      >
                        {property.listingType}
                      </span>
                      {property.premium && (
                        <Badge className="text-[10px] px-1.5 py-0 bg-brand-gold/20 text-brand-navy border-brand-gold/30 hover:bg-brand-gold/20">
                          Premium
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground truncate capitalize mb-2">
                      {property.category} · {property.neighborhood}, {property.city}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {property.currency} {Number(property.price).toLocaleString()}
                        {property.period ? `/${property.period === "monthly" ? "mo" : "yr"}` : ""}
                      </span>
                      <span className="flex items-center gap-1">
                        <BedDouble className="size-3" />
                        {property.bedrooms}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath className="size-3" />
                        {property.bathrooms}
                      </span>
                      <span className="flex items-center gap-1">
                        <Maximize2 className="size-3" />
                        {property.areaSqm} m²
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <TablePagination
              currentPage={page}
              totalPages={totalPages}
              totalCount={totalCount}
              onPageChange={setPage}
              entityLabel="properties"
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
