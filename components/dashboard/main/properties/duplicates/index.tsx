"use client";

import { Copy, ExternalLink, MapPin, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/common/loading";
import { useDuplicateProperties, DuplicateGroup } from "@/lib/queries/properties";

function statusColor(status: string) {
  switch (status) {
    case "LIVE": return "bg-green-100 text-green-800";
    case "PENDING": return "bg-yellow-100 text-yellow-800";
    case "REJECTED": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-700";
  }
}

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("fr-CD", { style: "currency", currency: currency ?? "USD", maximumFractionDigits: 0 }).format(price);
}

function GroupCard({ group, index }: { group: DuplicateGroup; index: number }) {
  const first = group.listings[0];
  const label = [first?.suburb, first?.category, first?.bedrooms != null ? `${first.bedrooms} ch.` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <Card className="border border-amber-200 bg-amber-50/40 dark:bg-amber-950/10 dark:border-amber-800">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Copy className="w-4 h-4 text-amber-600" />
          <CardTitle className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            Groupe {index + 1} — {group.listings.length} annonces similaires
          </CardTitle>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </CardHeader>

      <CardContent className="grid sm:grid-cols-2 gap-3">
        {group.listings.map((listing) => (
          <div
            key={listing.id}
            className="flex gap-3 bg-background rounded-lg border p-3 shadow-sm"
          >
            {/* Thumbnail */}
            {listing.gallery[0] ? (
              <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                <Image
                  src={listing.gallery[0]}
                  alt={listing.title}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-muted-foreground" />
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-1">
                <p className="text-xs font-medium leading-tight line-clamp-2 flex-1">
                  {listing.title}
                </p>
                <Link
                  href={`/properties/${listing.id}`}
                  target="_blank"
                  className="text-muted-foreground hover:text-foreground flex-shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              <p className="text-xs font-semibold text-foreground mt-1">
                {formatPrice(listing.price, listing.currency)}
              </p>

              <div className="flex items-center gap-1 mt-1">
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusColor(listing.status)}`}>
                  {listing.status}
                </span>
              </div>

              {listing.agent && (
                <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground">
                  <User className="w-3 h-3" />
                  <span className="truncate">{listing.agent.name}</span>
                </div>
              )}

              <p className="text-[10px] text-muted-foreground mt-0.5">
                {new Date(listing.createdAt).toLocaleDateString("fr-CD", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function DuplicateProperties() {
  const { data: groups = [], isLoading } = useDuplicateProperties();

  if (isLoading) return <Loading label="Chargement des doublons…" />;

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
        <Copy className="w-12 h-12 text-green-500" />
        <p className="text-lg font-semibold text-foreground">Aucun doublon détecté</p>
        <p className="text-sm text-muted-foreground">
          Toutes les annonces actives semblent uniques.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Annonces en doublon</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {groups.length} groupe{groups.length > 1 ? "s" : ""} de doublons potentiels détectés
          </p>
        </div>
        <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50">
          {groups.reduce((acc, g) => acc + g.listings.length, 0)} annonces concernées
        </Badge>
      </div>

      <div className="grid gap-4">
        {groups.map((group, i) => (
          <GroupCard key={group.key} group={group} index={i} />
        ))}
      </div>
    </div>
  );
}
