"use client";

import {
  ArrowLeft,
  BadgeCheck,
  Bath,
  Bed,
  Building2,
  CalendarDays,
  Home,
  ImageIcon,
  Landmark,
  MapPin,
  MoreVertical,
  Package,
  Pencil,
  Ruler,
  ShoppingBag,
  Star,
  Trash2,
  TrendingUp,
  User,
  Warehouse,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Loading } from "@/components/common/loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useProperty } from "@/lib/queries/properties";
import DeletePropertyDialog from "../dialogs/delete-agent";
import EditProperty from "../dialogs/edit-property/edit-property";
import PerformanceChart from "./performance-chart";

type Props = { propertyId: string };

const ICON_MAP: Record<string, typeof Home> = {
  building: Building2,
  home: Home,
  land: Landmark,
  office: Building2,
  store: ShoppingBag,
  warehouse: Warehouse,
};

const TYPE_STYLES: Record<string, { bg: string; text: string; label: string }> =
  {
    sale: { bg: "bg-brand-blue", text: "text-white", label: "For Sale" },
    rent: { bg: "bg-brand-gold", text: "text-brand-navy", label: "For Rent" },
    commercial: {
      bg: "bg-purple-600",
      text: "text-white",
      label: "Commercial",
    },
  };

function resolveAgentName(agent: unknown): string {
  if (!agent) return "–";
  if (typeof agent === "string") return agent;
  if (typeof agent === "object" && agent !== null && "name" in agent)
    return String((agent as Record<string, unknown>).name ?? "–");
  return "–";
}

function resolveAgentTitle(agent: unknown): string {
  if (!agent || typeof agent !== "object") return "";
  if ("title" in agent)
    return String((agent as Record<string, unknown>).title ?? "");
  return "";
}

function PropertyDetail({ propertyId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPageQuery = searchParams.get("queryPage");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const { data: property, isLoading } = useProperty(propertyId);

  if (isLoading) return <Loading label="Loading property" />;
  if (!property) return null;

  const typeStyle = TYPE_STYLES[property.listingType] ?? TYPE_STYLES.sale;
  const PropertyIcon = ICON_MAP[property.iconType ?? "home"] ?? Home;

  const agentName = resolveAgentName(property.agent);
  const agentTitle = resolveAgentTitle(property.agent);

  const agentInitials =
    agentName !== "–"
      ? agentName
          .split(" ")
          .map((w) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "AG";

  const priceDisplay =
    property.price != null
      ? `${property.currency ?? ""} ${Number(property.price).toLocaleString()}`
      : "–";

  const periodLabel =
    property.period === "monthly"
      ? "/mo"
      : property.period === "yearly"
        ? "/yr"
        : "";

  return (
    <div className="w-full flex flex-col gap-6 mx-auto">
      {/* ── Navigation ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            router.push(`/properties?queryPage=${currentPageQuery}`)
          }
          className="gap-2 text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="size-4" />
          Back to Properties
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="outline" className="h-8 w-8">
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem className="cursor-pointer" onClick={() => setEditOpen(true)}>
              <Pencil className="size-4 mr-2" />
              Edit property
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive hover:text-destructive cursor-pointer"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-4 mr-2 text-destructive" />
              Delete property
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Hero card ──────────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden">
        {/* Gradient background */}
        <div
          className={`absolute inset-0 ${property.imageGradient ?? "bg-gradient-to-br from-brand-navy to-[#1e3a6e]"}`}
        />
        <div className="absolute inset-0 bg-brand-navy/60" />
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/5 blur-3xl" />

        <div className="relative p-8">
          {/* Top row: badges */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${typeStyle.bg} ${typeStyle.text}`}
            >
              {typeStyle.label}
            </span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-white/80 border border-white/10 capitalize">
              {property.category}
            </span>
            {property.verified && (
              <span className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/20">
                <BadgeCheck className="size-3" />
                Verified
              </span>
            )}
            {property.premium && (
              <span className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-brand-gold/20 text-brand-gold border border-brand-gold/20">
                <Star className="size-3" />
                Premium
              </span>
            )}
            {property.isNew && (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-brand-blue/30 text-blue-200 border border-brand-blue/20">
                New
              </span>
            )}
          </div>

          {/* Title + price row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-white/10 border border-white/10 shrink-0">
                <PropertyIcon className="size-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                  {property.title}
                </h1>
                {property.subtitle && (
                  <p className="text-white/60 text-sm mt-1">
                    {property.subtitle}
                  </p>
                )}
                <div className="flex items-center gap-1.5 text-white/60 text-sm mt-2">
                  <MapPin className="size-3.5 shrink-0" />
                  {[property.suburb, property.neighborhood, property.city]
                    .filter(Boolean)
                    .join(", ")}
                </div>
              </div>
            </div>

            {/* Price block */}
            <div className="sm:text-right shrink-0">
              <p className="text-3xl font-bold text-white">
                {priceDisplay}
                {periodLabel && (
                  <span className="text-lg font-normal text-white/60">
                    {periodLabel}
                  </span>
                )}
              </p>
              {property.listedDaysAgo != null && (
                <p className="text-xs text-white/50 mt-1 flex items-center sm:justify-end gap-1">
                  <CalendarDays className="size-3" />
                  Listed{" "}
                  {property.listedDaysAgo === 0
                    ? "today"
                    : `${property.listedDaysAgo}d ago`}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Key facts bar ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Bed, label: "Bedrooms", value: property.bedrooms ?? "–" },
          { icon: Bath, label: "Bathrooms", value: property.bathrooms ?? "–" },
          {
            icon: Ruler,
            label: "Area",
            value: property.areaSqm ? `${property.areaSqm} m²` : "–",
          },
          { icon: Package, label: "Type", value: property.listingType ?? "–" },
        ].map(({ icon: Icon, label, value }) => (
          <Card key={label} className="card-luxury text-center">
            <CardContent className="p-4 flex flex-col items-center gap-1.5">
              <div className="p-2 rounded-lg bg-brand-blue/10">
                <Icon className="size-4 text-brand-blue" />
              </div>
              <span className="text-lg font-bold text-foreground capitalize">
                {String(value)}
              </span>
              <span className="text-xs text-muted-foreground">{label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Performance ────────────────────────────────────────── */}
      {property.performance && (
        <PerformanceChart
          performance={property.performance}
          listedDaysAgo={property.listedDaysAgo}
        />
      )}

      {/* ── Main content ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Location details */}
        <Card className="card-luxury">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <MapPin className="size-4 text-brand-blue" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-0">
            {[
              { label: "Suburb", value: property.suburb ?? "–" },
              { label: "Neighborhood", value: property.neighborhood ?? "–" },
              { label: "City", value: property.city ?? "–" },
              {
                label: "Zone",
                value: (property as { zone?: string }).zone ?? "–",
              },
            ].map(({ label, value }, i, arr) => (
              <div key={label}>
                <div className="flex items-center justify-between py-3">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    {label}
                  </span>
                  <span className="text-sm text-foreground font-medium">
                    {value}
                  </span>
                </div>
                {i < arr.length - 1 && <Separator className="opacity-50" />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Agent + listing info */}
        <div className="flex flex-col gap-4">
          {/* Agent card */}
          <Card className="card-luxury">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <User className="size-4 text-brand-gold" />
                Listing Agent
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-blue to-brand-navy flex items-center justify-center text-white font-bold text-sm shrink-0">
                {agentInitials}
              </div>
              <div>
                <p className="font-semibold text-foreground">{agentName}</p>
                {agentTitle && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {agentTitle}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pricing details */}
          <Card className="card-luxury">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="size-4 text-brand-gold" />
                Pricing Details
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-0">
              {[
                { label: "Price", value: priceDisplay + periodLabel },
                { label: "Currency", value: property.currency ?? "–" },
                {
                  label: "Transaction",
                  value:
                    (property as { transaction?: string }).transaction ??
                    property.listingType ??
                    "–",
                },
              ].map(({ label, value }, i, arr) => (
                <div key={label}>
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                      {label}
                    </span>
                    <span className="text-sm text-foreground font-semibold capitalize">
                      {value}
                    </span>
                  </div>
                  {i < arr.length - 1 && <Separator className="opacity-50" />}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Permit / reference tags */}
          {(() => {
            const detail = property as {
              reference?: string;
              permitNumber?: string;
              brokerLicense?: string;
            };
            const items = [
              { label: "Reference", value: detail.reference },
              { label: "Permit No.", value: detail.permitNumber },
              { label: "Broker License", value: detail.brokerLicense },
            ].filter((i) => i.value);

            return items.length > 0 ? (
              <Card className="card-luxury">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <BadgeCheck className="size-4 text-emerald-600" />
                    Reference Numbers
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-0">
                  {items.map(({ label, value }, i) => (
                    <div key={label}>
                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                          {label}
                        </span>
                        <Badge variant="outline" className="text-xs font-mono">
                          {value}
                        </Badge>
                      </div>
                      {i < items.length - 1 && (
                        <Separator className="opacity-50" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null;
          })()}
        </div>
      </div>

      {/* ── Gallery ────────────────────────────────────────────── */}
      {property.gallery && property.gallery.length > 0 && (
        <Card className="card-luxury">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ImageIcon className="size-4 text-brand-blue" />
              Gallery
              <span className="text-xs font-normal text-muted-foreground">
                ({property.gallery.length} photo{property.gallery.length !== 1 ? "s" : ""})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {property.gallery.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setLightboxUrl(url)}
                  className="group relative aspect-video rounded-lg overflow-hidden bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Property photo ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                    onError={(e) => {
                      (e.currentTarget.parentElement as HTMLElement).style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 bg-brand-navy/0 group-hover:bg-brand-navy/20 transition-colors" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Description ────────────────────────────────────────── */}
      {(property as { description?: string }).description && (
        <Card className="card-luxury">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {(property as { description?: string }).description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── Lightbox ───────────────────────────────────────────── */}
      {lightboxUrl && (
        <div
          role="dialog"
          aria-modal
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightboxUrl(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxUrl}
            alt="Full-size property photo"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            aria-label="Close lightbox"
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>
      )}

      <DeletePropertyDialog
        property={property}
        open={deleteOpen}
        setOpen={setDeleteOpen}
        onClose={() => setDeleteOpen(false)}
      />

      <EditProperty
        property={property}
        open={editOpen}
        setOpen={setEditOpen}
      />
    </div>
  );
}

export default PropertyDetail;
