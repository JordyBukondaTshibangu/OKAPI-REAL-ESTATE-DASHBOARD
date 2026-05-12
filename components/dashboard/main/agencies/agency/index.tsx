"use client";

import {
  ArrowLeft,
  Award,
  Briefcase,
  Building2,
  Globe,
  Mail,
  MapPin,
  MoreVertical,
  Pencil,
  Phone,
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
import DeleteAgencyDialog from "../dialogs/delete-agency";
import EditAgency from "../dialogs/edit-agency/edit-agency";

type Props = { agencyId: string };

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
      ? agency.name
          .split(" ")
          .map((w: string) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "AG");

  const stats = [
    {
      label: "Agents",
      value: agency.agentCount ?? "–",
      icon: Users,
      color: "text-brand-blue",
      bgColor: "bg-brand-blue/10",
    },
    {
      label: "Listings",
      value: agency.listingCount ?? "–",
      icon: Briefcase,
      color: "text-brand-gold",
      bgColor: "bg-brand-gold/10",
    },
    {
      label: "Closed Deals",
      value: agency.closedDeals ?? "–",
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-500/10",
    },
  ];

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
        {/* Gold accent orb */}
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-brand-gold/15 blur-3xl" />
        <div className="absolute -bottom-10 left-1/4 w-40 h-40 rounded-full bg-brand-blue/20 blur-2xl" />

        <div className="relative p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Monogram badge */}
          <div className="shrink-0 w-20 h-20 rounded-2xl bg-brand-gold flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-brand-navy tracking-tight">
              {monogram}
            </span>
          </div>

          {/* Identity */}
          <div className="flex-1">
            <div className="flex flex-wrap items-start gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {agency.name}
              </h1>
              {agency.founded && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 text-white/80 border border-white/10 mt-1">
                  Est. {agency.founded}
                </span>
              )}
            </div>

            {agency.tagline && (
              <p className="text-brand-gold/80 text-sm font-medium italic mb-3">
                &quot;{agency.tagline}&quot;
              </p>
            )}

            {/* Contact chips */}
            <div className="flex flex-wrap gap-3">
              {agency.email && (
                <a
                  href={`mailto:${agency.email}`}
                  className="flex items-center gap-1.5 text-white/70 hover:text-white text-xs transition-colors"
                >
                  <Mail className="size-3.5 shrink-0" />
                  {agency.email}
                </a>
              )}
              {agency.phone && (
                <a
                  href={`tel:${agency.phone}`}
                  className="flex items-center gap-1.5 text-white/70 hover:text-white text-xs transition-colors"
                >
                  <Phone className="size-3.5 shrink-0" />
                  {agency.phone}
                </a>
              )}
              {agency.website && (
                <a
                  href={agency.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-white/70 hover:text-white text-xs transition-colors"
                >
                  <Globe className="size-3.5 shrink-0" />
                  {agency.website.replace(/^https?:\/\//, "")}
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
                <p className="text-2xl font-bold text-foreground leading-none">
                  {value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Main content ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact & Location */}
        <Card className="card-luxury">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <MapPin className="size-4 text-brand-blue" />
              Contact & Location
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-0">
            {[
              { label: "Address", value: agency.address ?? "–", icon: MapPin },
              { label: "Email", value: agency.email ?? "–", icon: Mail },
              { label: "Phone", value: agency.phone ?? "–", icon: Phone },
              { label: "Website", value: agency.website ?? "–", icon: Globe },
            ].map(({ label, value, icon: Icon }, i, arr) => (
              <div key={label}>
                <div className="flex items-center justify-between py-3 gap-4">
                  <div className="flex items-center gap-2 shrink-0">
                    <Icon className="size-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                      {label}
                    </span>
                  </div>
                  <span className="text-sm text-foreground font-medium text-right break-all max-w-[55%]">
                    {value}
                  </span>
                </div>
                {i < arr.length - 1 && <Separator className="opacity-50" />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Expertise & Coverage */}
        <div className="flex flex-col gap-4">
          {agency.specializations && agency.specializations.length > 0 && (
            <Card className="card-luxury">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Award className="size-4 text-brand-gold" />
                  Specializations
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {(agency.specializations as string[]).map((spec) => (
                  <Badge key={spec} variant="secondary" className="text-xs">
                    {spec}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}

          {agency.areasServed && agency.areasServed.length > 0 && (
            <Card className="card-luxury">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <MapPin className="size-4 text-brand-blue" />
                  Areas Served
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {(agency.areasServed as string[]).map((area) => (
                  <Badge key={area} variant="outline" className="text-xs">
                    {area}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}

          {agency.languages && agency.languages.length > 0 && (
            <Card className="card-luxury">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Globe className="size-4 text-brand-blue" />
                  Languages
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {(agency.languages as string[]).map((lang) => (
                  <Badge key={lang} variant="secondary" className="text-xs">
                    {lang}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}

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
                  <Badge
                    key={cert}
                    className="text-xs bg-emerald-500/10 text-emerald-700 border-emerald-200 hover:bg-emerald-500/20"
                  >
                    {cert}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
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
