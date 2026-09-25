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
  Loader2,
  MapPin,
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
  XCircle,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Loading } from "@/components/common/loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useApproveProperty, useProperty, useRejectProperty, useUpdateProperty } from "@/lib/queries/properties";
import { useTranslation } from "@/hooks/use-translation";
import DeletePropertyDialog from "../dialogs/delete-agent";
import EditProperty from "../dialogs/edit-property/edit-property";
import PerformanceChart from "./performance-chart";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type Props = { propertyId: string };

const ICON_MAP: Record<string, typeof Home> = {
  building: Building2,
  home: Home,
  land: Landmark,
  office: Building2,
  store: ShoppingBag,
  warehouse: Warehouse,
};

const TYPE_STYLES: Record<string, { bg: string; text: string }> = {
  sale: { bg: "bg-brand-blue", text: "text-white" },
  rent: { bg: "bg-brand-gold", text: "text-brand-navy" },
  commercial: { bg: "bg-purple-600", text: "text-white" },
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
  const fromPending = searchParams.get("from") === "pending";
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const t = useTranslation();
  const d = t.properties.detail;

  const { data: property, isLoading } = useProperty(propertyId);
  const approve = useApproveProperty();
  const reject = useRejectProperty();
  const updateProperty = useUpdateProperty();

  const handleRemovePhoto = (url: string) => {
    if (!property) return;
    const newGallery = (property.gallery ?? []).filter((u) => u !== url);
    updateProperty.mutate({ id: propertyId, gallery: newGallery });
  };

  const isPending = (property as any)?.status === "PENDING";

  if (isLoading) return <Loading label={d.loadingLabel} />;
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
            fromPending
              ? router.push("/properties?tab=pending")
              : router.push(`/properties?queryPage=${currentPageQuery}`)
          }
          className="gap-2 text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="size-4" />
          {fromPending ? d.backToRequests : d.backToProperties}
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 h-8" onClick={() => setEditOpen(true)}>
            <Pencil className="size-3.5" />
            {d.editBtn}
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 h-8 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="size-3.5" />
            {d.deleteBtn}
          </Button>
        </div>
      </div>

      {/* ── Pending review banner ──────────────────────────────── */}
      {isPending && (
        <div className="flex items-center justify-between gap-4 flex-wrap rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
              <BadgeCheck className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                {d.pendingBannerTitle}
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                {d.pendingBannerDesc}
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
              onClick={() =>
                approve.mutate(propertyId, {
                  onSuccess: () => router.push("/properties?tab=pending"),
                })
              }
              disabled={approve.isPending || reject.isPending}
            >
              {approve.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <BadgeCheck className="w-3.5 h-3.5" />
              )}
              {d.approveBtn}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 gap-1.5"
              onClick={() => { setRejectOpen(true); setRejectReason(""); }}
              disabled={approve.isPending || reject.isPending}
            >
              <XCircle className="w-3.5 h-3.5" />
              {d.rejectBtn}
            </Button>
          </div>
        </div>
      )}

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
              {property.listingType === "rent" ? d.typeForRent : property.listingType === "commercial" ? d.typeCommercial : d.typeForSale}
            </span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-white/80 border border-white/10 capitalize">
              {property.category}
            </span>
            {property.verified && (
              <span className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/20">
                <BadgeCheck className="size-3" />
                {d.badgeVerified}
              </span>
            )}
            {property.premium && (
              <span className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-brand-gold/20 text-brand-gold border border-brand-gold/20">
                <Star className="size-3" />
                {d.badgePremium}
              </span>
            )}
            {property.isNew && (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-brand-blue/30 text-blue-200 border border-brand-blue/20">
                {d.badgeNew}
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
                  {property.listedDaysAgo === 0
                    ? d.listedToday
                    : d.listedDaysAgo.replace("{n}", String(property.listedDaysAgo))}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Key facts bar ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Bed, label: d.factBedrooms, value: property.bedrooms ?? "–" },
          { icon: Bath, label: d.factBathrooms, value: property.bathrooms ?? "–" },
          {
            icon: Ruler,
            label: d.factArea,
            value: property.areaSqm ? `${property.areaSqm} m²` : "–",
          },
          { icon: Package, label: d.factType, value: property.listingType ?? "–" },
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
          labels={{
            title: d.perfTitle,
            since: d.perfSince,
            viewed: d.perfViewed,
            shared: d.perfShared,
            saved: d.perfSaved,
            whatsApp: d.perfWhatsApp,
            disclaimer: d.perfDisclaimer,
          }}
        />
      )}

      {/* ── Main content ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Location details */}
        <Card className="card-luxury">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <MapPin className="size-4 text-brand-blue" />
              {d.sectionLocation}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-0">
            {[
              { label: d.locSuburb, value: property.suburb ?? "–" },
              { label: d.locNeighborhood, value: property.neighborhood ?? "–" },
              { label: d.locCity, value: property.city ?? "–" },
              {
                label: d.locZone,
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
                {d.sectionAgent}
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
                {d.sectionPricing}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-0">
              {[
                { label: d.priceLabel, value: priceDisplay + periodLabel },
                { label: d.currencyLabel, value: property.currency ?? "–" },
                {
                  label: d.transactionLabel,
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
              { label: d.refLabel, value: detail.reference },
              { label: d.permitLabel, value: detail.permitNumber },
              { label: d.brokerLabel, value: detail.brokerLicense },
            ].filter((i) => i.value);

            return items.length > 0 ? (
              <Card className="card-luxury">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <BadgeCheck className="size-4 text-emerald-600" />
                    {d.sectionRefNumbers}
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

      {/* ── Extra details (furnished, availability, amenities) ─── */}
      {(() => {
        const p = property as any;
        const rows = [
          p.isFurnished !== undefined && { label: d.featFurnished, value: p.isFurnished ? d.featYes : d.featNo },
          p.availableFrom && { label: d.featAvailFrom, value: new Date(p.availableFrom).toLocaleDateString(undefined, { day: "2-digit", month: "long", year: "numeric" }) },
          p.landmark && { label: d.featLandmark, value: p.landmark },
          p.isShortTerm && { label: d.featShortTerm, value: d.featYes },
          p.pricePerNight && { label: d.featPricePerNight, value: `${p.currency ?? ""} ${Number(p.pricePerNight).toLocaleString()}` },
          p.minStayNights && { label: d.featMinStay, value: `${p.minStayNights} ${d.featNights}` },
          p.maxStayNights && { label: d.featMaxStay, value: `${p.maxStayNights} ${d.featNights}` },
        ].filter(Boolean) as { label: string; value: string }[];

        const amenities: string[] = Array.isArray(p.amenities) ? p.amenities : [];

        if (rows.length === 0 && amenities.length === 0) return null;

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rows.length > 0 && (
              <Card className="card-luxury">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">{d.sectionFeatures}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-0">
                  {rows.map(({ label, value }, i) => (
                    <div key={label}>
                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</span>
                        <span className="text-sm text-foreground font-medium">{value}</span>
                      </div>
                      {i < rows.length - 1 && <Separator className="opacity-50" />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            {amenities.length > 0 && (
              <Card className="card-luxury">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">{d.sectionAmenities} ({amenities.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {amenities.map((a) => (
                      <span key={a} className="text-xs px-2.5 py-1 rounded-full bg-brand-blue/10 text-brand-blue font-medium capitalize">
                        {a}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );
      })()}

      {/* ── Gallery ────────────────────────────────────────────── */}
      {property.gallery && property.gallery.length > 0 && (
        <Card className="card-luxury">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ImageIcon className="size-4 text-brand-blue" />
              {d.sectionGallery}
              <span className="text-xs font-normal text-muted-foreground">
                ({property.gallery.length} {property.gallery.length !== 1 ? d.galleryPhotos : d.galleryPhoto})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {property.gallery.map((url, idx) => (
                <div
                  key={idx}
                  className="group relative aspect-video rounded-lg overflow-hidden bg-muted"
                >
                  <button
                    type="button"
                    onClick={() => setLightboxUrl(url)}
                    className="absolute inset-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Property photo ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      onError={(e) => {
                        (e.currentTarget.closest("div[class*='group']") as HTMLElement | null)?.style.setProperty("display", "none");
                      }}
                    />
                    <div className="absolute inset-0 bg-brand-navy/0 group-hover:bg-brand-navy/20 transition-colors" />
                  </button>
                  <button
                    type="button"
                    aria-label="Remove photo"
                    onClick={(e) => { e.stopPropagation(); handleRemovePhoto(url); }}
                    className="absolute top-1.5 right-1.5 z-10 flex items-center justify-center w-6 h-6 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 focus:outline-none"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Description ────────────────────────────────────────── */}
      {(property as { description?: string }).description && (
        <Card className="card-luxury">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">{d.sectionDescription}</CardTitle>
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

      {/* ── Reject dialog ──────────────────────────────────────── */}
      <Dialog open={rejectOpen} onOpenChange={(v) => { if (!v) setRejectOpen(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{d.rejectDialogTitle}</DialogTitle>
            <DialogDescription>
              {d.rejectDialogDesc}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder={d.rejectPlaceholder}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              {d.rejectCancelBtn}
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={!rejectReason.trim() || reject.isPending}
              onClick={() =>
                reject.mutate(
                  { id: propertyId, reason: rejectReason.trim() },
                  { onSuccess: () => { setRejectOpen(false); router.push("/properties?tab=pending"); } },
                )
              }
            >
              {reject.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
              {d.rejectConfirmBtn}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PropertyDetail;
