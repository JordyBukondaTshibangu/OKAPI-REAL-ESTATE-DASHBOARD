"use client";

import {
  BadgeCheck,
  Bath,
  Bed,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Home,
  ImageIcon,
  Landmark,
  Loader2,
  MapPin,
  Package,
  Ruler,
  ShoppingBag,
  Star,
  User,
  Warehouse,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";

import { Loading } from "@/components/common/loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  useApproveProperty,
  useProperty,
  useRejectProperty,
} from "@/lib/queries/properties";

const ICON_MAP: Record<string, typeof Home> = {
  building: Building2,
  home: Home,
  land: Landmark,
  office: Building2,
  store: ShoppingBag,
  warehouse: Warehouse,
};

function resolveAgentName(agent: unknown): string {
  if (!agent) return "–";
  if (typeof agent === "string") return agent;
  if (typeof agent === "object" && agent !== null && "name" in agent)
    return String((agent as Record<string, unknown>).name ?? "–");
  return "–";
}

function Row({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === "" || value === "–") return null;
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-sm text-foreground font-medium text-right capitalize">
        {String(value)}
      </span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mt-5 mb-1">
      {children}
    </p>
  );
}

type Props = {
  propertyId: string | null;
  onClose: () => void;
  onApproved?: () => void;
};

export function PropertyDetailSheet({ propertyId, onClose, onApproved }: Props) {
  const { data: property, isLoading } = useProperty(propertyId ?? "");
  const approve = useApproveProperty();
  const reject = useRejectProperty();

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const p = property as any;
  const isPending = p?.status === "PENDING";
  const agentName = resolveAgentName(p?.agent);
  const agencyName = p?.agency?.name ?? p?.agent?.agency?.name ?? null;

  const priceDisplay =
    p?.price != null
      ? `${p.currency ?? "USD"} ${Number(p.price).toLocaleString("fr-FR")}`
      : "–";

  const gallery: string[] = Array.isArray(p?.gallery) ? p.gallery : [];
  const amenities: string[] = Array.isArray(p?.amenities) ? p.amenities : [];

  const PropertyIcon = ICON_MAP[p?.iconType ?? "home"] ?? Home;

  return (
    <>
      <Sheet open={!!propertyId} onOpenChange={(open) => { if (!open) onClose(); }}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl flex flex-col p-0 gap-0 overflow-hidden"
        >
          {/* Header */}
          <SheetHeader className="px-5 py-4 border-b border-border shrink-0">
            <div className="flex items-center justify-between gap-3">
              <SheetTitle className="text-base font-semibold truncate">
                {isLoading ? "Chargement…" : p?.title ?? "Annonce"}
              </SheetTitle>
              <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Action row (only for pending) */}
            {!isLoading && isPending && (
              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white gap-1.5 flex-1"
                  disabled={approve.isPending || reject.isPending}
                  onClick={() =>
                    approve.mutate(p.id, {
                      onSuccess: () => { onClose(); onApproved?.(); },
                    })
                  }
                >
                  {approve.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <BadgeCheck className="w-3.5 h-3.5" />
                  )}
                  Approuver
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 gap-1.5 flex-1"
                  disabled={approve.isPending || reject.isPending}
                  onClick={() => { setRejectOpen(true); setRejectReason(""); }}
                >
                  {reject.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  Rejeter
                </Button>
              </div>
            )}
          </SheetHeader>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loading label="Chargement de l'annonce…" />
              </div>
            ) : !p ? (
              <p className="text-sm text-muted-foreground text-center py-12">Annonce introuvable.</p>
            ) : (
              <>
                {/* Photo gallery */}
                {gallery.length > 0 && (
                  <>
                    <SectionTitle>
                      <span className="flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5" />
                        Photos ({gallery.length})
                      </span>
                    </SectionTitle>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      {gallery.map((url: string, idx: number) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setLightboxIdx(idx)}
                          className="aspect-video rounded-lg overflow-hidden bg-muted group relative"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt={`Photo ${idx + 1}`}
                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                            onError={(e) => {
                              (e.currentTarget.parentElement as HTMLElement).style.display = "none";
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* Status badges */}
                <SectionTitle>Statut</SectionTitle>
                <div className="flex flex-wrap gap-2 mt-1">
                  {p.listingType === "sale" ? (
                    <Badge className="bg-brand-navy text-white text-xs">Vente</Badge>
                  ) : p.listingType === "rent" ? (
                    <Badge className="bg-amber-500 text-white text-xs">Location</Badge>
                  ) : (
                    <Badge className="bg-purple-600 text-white text-xs capitalize">{p.listingType}</Badge>
                  )}
                  {p.status && (
                    <Badge
                      variant="outline"
                      className={
                        p.status === "PENDING"
                          ? "border-amber-300 bg-amber-50 text-amber-700 text-xs"
                          : p.status === "ACTIVE"
                          ? "border-green-300 bg-green-50 text-green-700 text-xs"
                          : "text-xs"
                      }
                    >
                      {p.status}
                    </Badge>
                  )}
                  {p.verified && (
                    <Badge className="bg-emerald-600 text-white gap-1 text-xs">
                      <BadgeCheck className="w-3 h-3" /> Vérifié
                    </Badge>
                  )}
                  {p.premium && (
                    <Badge className="bg-brand-gold text-brand-navy gap-1 text-xs">
                      <Star className="w-3 h-3" /> Premium
                    </Badge>
                  )}
                </div>

                {/* Key facts */}
                <SectionTitle>Caractéristiques principales</SectionTitle>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {[
                    { icon: Bed, label: "Chambres", value: p.bedrooms },
                    { icon: Bath, label: "Salles de bain", value: p.bathrooms },
                    { icon: Ruler, label: "Surface", value: p.areaSqm ? `${p.areaSqm} m²` : null },
                    { icon: Package, label: "Catégorie", value: p.category },
                    { icon: PropertyIcon, label: "Type", value: p.listingType },
                  ]
                    .filter((f) => f.value !== null && f.value !== undefined)
                    .map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                        <Icon className="w-4 h-4 text-brand-blue shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
                          <p className="text-sm font-semibold text-foreground capitalize truncate">
                            {String(value)}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Pricing */}
                <SectionTitle>Prix</SectionTitle>
                <Row label="Prix" value={priceDisplay + (p.period === "monthly" ? " / mois" : p.period === "yearly" ? " / an" : "")} />
                <Row label="Devise" value={p.currency} />
                {p.pricePerNight && <Row label="Prix / nuit" value={`${p.currency ?? "USD"} ${Number(p.pricePerNight).toLocaleString("fr-FR")}`} />}
                {p.minStayNights && <Row label="Séjour min." value={`${p.minStayNights} nuits`} />}
                {p.maxStayNights && <Row label="Séjour max." value={`${p.maxStayNights} nuits`} />}

                {/* Location */}
                <SectionTitle>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Localisation
                  </span>
                </SectionTitle>
                <Row label="Quartier" value={p.suburb} />
                <Row label="Commune" value={p.neighborhood} />
                <Row label="Ville" value={p.city} />
                <Row label="Zone" value={p.zone} />
                <Row label="Point de repère" value={p.landmark} />

                {/* Agent / Agency */}
                <SectionTitle>
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Agent & Agence
                  </span>
                </SectionTitle>
                <Row label="Agent" value={agentName} />
                <Row label="Titre" value={(p.agent as any)?.title} />
                <Row label="Email agent" value={(p.agent as any)?.email} />
                <Row label="Téléphone" value={(p.agent as any)?.phone} />
                {agencyName && (
                  <>
                    <Row label="Agence" value={agencyName} />
                    <Building2 className="hidden" />
                  </>
                )}

                {/* Extra details */}
                <SectionTitle>Détails supplémentaires</SectionTitle>
                <Row label="Meublé" value={p.isFurnished !== undefined ? (p.isFurnished ? "Oui" : "Non") : undefined} />
                <Row label="Courte durée" value={p.isShortTerm ? "Oui" : undefined} />
                <Row label="Longue durée" value={p.isLongTerm ? "Oui" : undefined} />
                {p.availableFrom && (
                  <Row
                    label="Disponible à partir du"
                    value={new Date(p.availableFrom).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  />
                )}
                <Row label="Publié" value={p.listedDaysAgo === 0 ? "Aujourd'hui" : p.listedDaysAgo != null ? `Il y a ${p.listedDaysAgo} jour(s)` : undefined} />

                {/* Reference numbers */}
                {(p.reference || p.permitNumber || p.brokerLicense || p.agentLicense) && (
                  <>
                    <SectionTitle>Références</SectionTitle>
                    <Row label="Référence" value={p.reference} />
                    <Row label="N° Permis" value={p.permitNumber} />
                    <Row label="Licence courtier" value={p.brokerLicense} />
                    <Row label="Licence agent" value={p.agentLicense} />
                  </>
                )}

                {/* Amenities */}
                {amenities.length > 0 && (
                  <>
                    <SectionTitle>Équipements ({amenities.length})</SectionTitle>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {amenities.map((a: string) => (
                        <span
                          key={a}
                          className="text-xs px-2.5 py-1 rounded-full bg-brand-blue/10 text-brand-blue font-medium capitalize"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </>
                )}

                {/* Description */}
                {p.description && (
                  <>
                    <SectionTitle>Description</SectionTitle>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line mt-1">
                      {p.description}
                    </p>
                  </>
                )}

                <div className="h-6" />
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Lightbox */}
      {lightboxIdx !== null && gallery.length > 0 && (
        <div
          role="dialog"
          aria-modal
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90"
          onClick={() => setLightboxIdx(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={gallery[lightboxIdx]}
            alt="Photo plein écran"
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            aria-label="Fermer"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
            onClick={() => setLightboxIdx(null)}
          >
            <X className="w-5 h-5" />
          </button>
          {lightboxIdx > 0 && (
            <button
              type="button"
              className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
              onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx - 1); }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {lightboxIdx < gallery.length - 1 && (
            <button
              type="button"
              className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
              onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx + 1); }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
          <div className="absolute bottom-4 text-white/60 text-sm">
            {lightboxIdx + 1} / {gallery.length}
          </div>
        </div>
      )}

      {/* Reject dialog */}
      <Dialog open={rejectOpen} onOpenChange={(v) => { if (!v) setRejectOpen(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter l'annonce</DialogTitle>
            <DialogDescription>
              Indiquez la raison du rejet. L'agent en sera informé.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Ex : Photos insuffisantes, prix incohérent…"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Annuler
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={!rejectReason.trim() || reject.isPending}
              onClick={() => {
                if (!p?.id) return;
                reject.mutate(
                  { id: p.id, reason: rejectReason.trim() },
                  {
                    onSuccess: () => {
                      setRejectOpen(false);
                      onClose();
                      onApproved?.();
                    },
                  },
                );
              }}
            >
              {reject.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
              Confirmer le rejet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
