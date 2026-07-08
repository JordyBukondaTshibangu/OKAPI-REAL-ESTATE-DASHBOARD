"use client";

import {
  ArrowLeft,
  Award,
  BadgeCheck,
  Briefcase,
  Building2,
  CalendarDays,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  MoreVertical,
  Pencil,
  Phone,
  Shield,
  ShieldCheck,
  Trash2,
  TrendingUp,
  Users,
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
import { useAgency } from "@/lib/queries/agencies";
import DetailPropertiesList from "@/components/dashboard/main/_common/detail-properties-list";
import DeleteAgencyDialog from "../dialogs/delete-agency";
import EditAgency from "../dialogs/edit-agency/edit-agency";

type Props = { agencyId: string };

const RENTAL_FOCUS_LABELS: Record<string, string> = {
  LONG_TERM: "Location longue durée",
  SHORT_TERM: "Location courte durée",
  BOTH: "Les deux",
};

const VERIFICATION_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  VERIFIE:     { label: "Vérifiée",   className: "bg-emerald-500/10 text-emerald-700 border-emerald-200" },
  NON_VERIFIE: { label: "En attente", className: "bg-yellow-500/10 text-yellow-700 border-yellow-200" },
};

function fmt(date: string | Date | null | undefined): string {
  if (!date) return "–";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

function AgencyDetail({ agencyId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPageQuery = searchParams.get("queryPage");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const { data: agency, isLoading } = useAgency(agencyId);

  if (isLoading) return <Loading label="Loading agency" />;
  if (!agency) return null;

  const monogram =
    agency.monogram ||
    (agency.name
      ? agency.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
      : "AG");

  const verificationCfg =
    VERIFICATION_STATUS_CONFIG[agency.verificationTier ?? "NON_VERIFIE"] ??
    VERIFICATION_STATUS_CONFIG.NON_VERIFIE;

  const stats = [
    { label: "Agents",       value: agency.agentCount  ?? agency.agents?.length ?? "–", icon: Users,     color: "text-brand-blue",  bgColor: "bg-brand-blue/10"  },
    { label: "Listings",     value: agency.listingCount ?? "–",                          icon: Briefcase, color: "text-brand-gold",  bgColor: "bg-brand-gold/10"  },
    { label: "Closed Deals", value: agency.closedDeals  ?? "–",                          icon: TrendingUp, color: "text-emerald-600", bgColor: "bg-emerald-500/10" },
  ];

  const agentsOwner = (agency.agents as any[] | undefined)?.find(
    (a: any) => a.agentType === "AGENCY_OWNER"
  );

  return (
    <div className="w-full flex flex-col gap-6 mx-auto">
      {/* ── Navigation ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/agencies?queryPage=${currentPageQuery}`)}
          className="gap-2 text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="size-4" />
          Back to Agencies
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
              Edit agency
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive hover:text-destructive cursor-pointer"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-4 mr-2 text-destructive" />
              Delete agency
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Hero card ──────────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-brand-navy via-[#0d2347] to-brand-navy" />
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-brand-gold/15 blur-3xl" />
        <div className="absolute -bottom-10 left-1/4 w-40 h-40 rounded-full bg-brand-blue/20 blur-2xl" />

        <div className="relative p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Monogram / logo */}
          <div className="shrink-0 w-20 h-20 rounded-2xl bg-brand-gold flex items-center justify-center shadow-lg">
            {agency.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={agency.logoUrl} alt={agency.name} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <span className="text-2xl font-bold text-brand-navy tracking-tight">{monogram}</span>
            )}
          </div>

          {/* Identity */}
          <div className="flex-1">
            <div className="flex flex-wrap items-start gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{agency.name}</h1>
              {agency.founded && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 text-white/80 border border-white/10 mt-1">
                  Est. {agency.founded}
                </span>
              )}
              <Badge className={`text-xs mt-0.5 ${verificationCfg.className}`}>
                {verificationCfg.label}
              </Badge>
              {agency.rccmNumber && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 mt-1 flex items-center gap-1">
                  <ShieldCheck className="size-3" />
                  RCCM: {agency.rccmNumber}
                </span>
              )}
            </div>

            {agency.tagline && (
              <p className="text-brand-gold/80 text-sm font-medium italic mb-3">
                &quot;{agency.tagline}&quot;
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              {agency.email && (
                <a href={`mailto:${agency.email}`} className="flex items-center gap-1.5 text-white/70 hover:text-white text-xs transition-colors">
                  <Mail className="size-3.5 shrink-0" /> {agency.email}
                </a>
              )}
              {agency.phone && (
                <a href={`tel:${agency.phone}`} className="flex items-center gap-1.5 text-white/70 hover:text-white text-xs transition-colors">
                  <Phone className="size-3.5 shrink-0" /> {agency.phone}
                </a>
              )}
              {(agency as any).whatsapp && (
                <a href={`https://wa.me/${((agency as any).whatsapp as string).replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-white/70 hover:text-white text-xs transition-colors">
                  <MessageCircle className="size-3.5 shrink-0" /> {(agency as any).whatsapp}
                </a>
              )}
              {agency.website && (
                <a href={agency.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-white/70 hover:text-white text-xs transition-colors">
                  <Globe className="size-3.5 shrink-0" /> {agency.website.replace(/^https?:\/\//, "")}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats strip ────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bgColor }) => (
          <Card key={label} className="card-luxury">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`${bgColor} p-2.5 rounded-xl shrink-0`}>
                <Icon className={`size-5 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Main content grid ──────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Contact & Location */}
        <Card className="card-luxury">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <MapPin className="size-4 text-brand-blue" />
              Contact & Localisation
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-0">
            {[
              { label: "Adresse",   value: agency.address  ?? "–", icon: MapPin },
              { label: "Email",     value: agency.email    ?? "–", icon: Mail },
              { label: "Téléphone", value: agency.phone    ?? "–", icon: Phone },
              { label: "WhatsApp",  value: (agency as any).whatsapp ?? "–", icon: MessageCircle },
              { label: "Site web",  value: agency.website  ?? "–", icon: Globe },
            ].map(({ label, value, icon: Icon }, i, arr) => (
              <div key={label}>
                <div className="flex items-center justify-between py-3 gap-4">
                  <div className="flex items-center gap-2 shrink-0">
                    <Icon className="size-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</span>
                  </div>
                  <span className="text-sm text-foreground font-medium text-right break-all max-w-[55%]">{value}</span>
                </div>
                {i < arr.length - 1 && <Separator className="opacity-50" />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Activité & Marché */}
        <Card className="card-luxury">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Building2 className="size-4 text-brand-gold" />
              Activité & Marché
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {/* Rental focus */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Focus</span>
              <Badge variant="secondary" className="text-xs">
                {RENTAL_FOCUS_LABELS[(agency as any).rentalFocus ?? "BOTH"] ?? "–"}
              </Badge>
            </div>
            <Separator className="opacity-50" />
            {/* Communes */}
            {(agency as any).communes?.length > 0 && (
              <>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">Communes couverts</p>
                  <div className="flex flex-wrap gap-1.5">
                    {((agency as any).communes as string[]).map((c) => (
                      <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                    ))}
                  </div>
                </div>
                <Separator className="opacity-50" />
              </>
            )}
            {/* Property types */}
            {(agency as any).propertyTypes?.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">Types de biens</p>
                <div className="flex flex-wrap gap-1.5">
                  {((agency as any).propertyTypes as string[]).map((t) => (
                    <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vérification & Freemium */}
        <Card className="card-luxury">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Shield className="size-4 text-emerald-600" />
              Vérification & Freemium
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-0">
            {[
              { label: "Statut",          value: verificationCfg.label },
              { label: "RCCM",            value: (agency as any).rccmNumber ?? "–" },
              { label: "Approuvée le",    value: fmt((agency as any).approvedAt) },
              { label: "Période gratuite jusqu'au", value: fmt((agency as any).gracePeriodEndsAt) },
              { label: "Cap annonces",    value: (agency as any).freeListingCap != null ? String((agency as any).freeListingCap) : "–" },
            ].map(({ label, value }, i, arr) => (
              <div key={label}>
                <div className="flex items-center justify-between py-3 gap-4">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium shrink-0">{label}</span>
                  <span className="text-sm text-foreground font-medium text-right break-all max-w-[55%]">{value}</span>
                </div>
                {i < arr.length - 1 && <Separator className="opacity-50" />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Langues & Équipe */}
        <div className="flex flex-col gap-4">
          {/* Owner agent */}
          {agentsOwner && (
            <Card className="card-luxury border-t-2 border-t-brand-gold">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BadgeCheck className="size-4 text-brand-gold" />
                  Propriétaire
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                {agentsOwner.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={agentsOwner.photo} alt={agentsOwner.name} className="w-10 h-10 rounded-xl object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-brand-gold/20 flex items-center justify-center text-sm font-bold text-brand-gold">
                    {agentsOwner.name?.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-foreground">{agentsOwner.name}</p>
                  <p className="text-xs text-muted-foreground">{agentsOwner.email}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Languages */}
          {agency.languages && agency.languages.length > 0 && (
            <Card className="card-luxury">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Globe className="size-4 text-brand-blue" />
                  Langues parlées
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {(agency.languages as string[]).map((lang) => (
                  <Badge key={lang} variant="secondary" className="text-xs">{lang}</Badge>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Specializations */}
          {agency.specializations && agency.specializations.length > 0 && (
            <Card className="card-luxury">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Award className="size-4 text-brand-gold" />
                  Spécialisations
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {(agency.specializations as string[]).map((spec) => (
                  <Badge key={spec} variant="secondary" className="text-xs">{spec}</Badge>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Certifications */}
          {agency.certifications && agency.certifications.length > 0 && (
            <Card className="card-luxury">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Building2 className="size-4 text-emerald-600" />
                  Certifications
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {(agency.certifications as string[]).map((cert) => (
                  <Badge key={cert} className="text-xs bg-emerald-500/10 text-emerald-700 border-emerald-200 hover:bg-emerald-500/20">
                    {cert}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ── Agents list ────────────────────────────────────────── */}
      {agency.agents && (agency.agents as any[]).length > 0 && (
        <Card className="card-luxury">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="size-4 text-brand-blue" />
              Équipe ({(agency.agents as any[]).length} agent{(agency.agents as any[]).length > 1 ? "s" : ""})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-0">
            {(agency.agents as any[]).map((a: any, i: number, arr: any[]) => (
              <div key={a.id}>
                <div className="flex items-center gap-3 py-3">
                  {a.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.photo} alt={a.name} className="w-9 h-9 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-brand-blue/10 flex items-center justify-center text-xs font-bold text-brand-blue shrink-0">
                      {a.name?.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{a.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{a.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {a.agentType === "AGENCY_OWNER" && (
                      <Badge className="text-xs bg-brand-gold/10 text-brand-gold border-brand-gold/20">Propriétaire</Badge>
                    )}
                    <Badge
                      variant="outline"
                      className={`text-xs ${a.verificationTier === "VERIFIE" ? "text-emerald-600 border-emerald-300" : "text-yellow-600 border-yellow-300"}`}
                    >
                      {a.verificationTier === "VERIFIE" ? "Vérifié" : "En attente"}
                    </Badge>
                  </div>
                </div>
                {i < arr.length - 1 && <Separator className="opacity-50" />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── Properties ─────────────────────────────────────────── */}
      <DetailPropertiesList agencyId={agencyId} />

      {/* ── Creation date ──────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground pb-4">
        <CalendarDays className="size-3.5" />
        Créée le {fmt(agency.createdAt)}
      </div>

      <DeleteAgencyDialog
        agency={agency}
        open={deleteOpen}
        setOpen={setDeleteOpen}
        onClose={() => setDeleteOpen(false)}
      />
      <EditAgency agency={agency} open={editOpen} setOpen={setEditOpen} />
    </div>
  );
}

export default AgencyDetail;
