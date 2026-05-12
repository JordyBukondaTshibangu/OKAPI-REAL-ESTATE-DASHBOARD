"use client";

import {
  ArrowLeft,
  Award,
  BadgeCheck,
  Briefcase,
  Globe,
  MoreVertical,
  Pencil,
  Phone,
  Star,
  Trash2,
  TrendingUp,
  User,
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
import { useAgent } from "@/lib/queries/agents";
import DeleteAgentDialog from "../dialogs/delete-agent";
import EditAgent from "../dialogs/edit-agent/edit-agent";

type Props = { agentId: string };

const TITLE_COLORS: Record<string, string> = {
  SUPERAGENT: "bg-brand-gold text-brand-navy",
  "AGENT EXCLUSIF": "bg-brand-blue text-white",
  AGENT: "bg-muted text-muted-foreground",
};

function resolveString(val: unknown): string {
  if (!val) return "–";
  if (typeof val === "string") return val;
  if (typeof val === "object" && val !== null && "name" in val)
    return String((val as Record<string, unknown>).name ?? "–");
  return "–";
}

function AgentDetail({ agentId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPageQuery = searchParams.get("queryPage");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const { data: agent, isLoading } = useAgent(agentId);

  if (isLoading) return <Loading label="Loading agent" />;
  if (!agent) return null;

  const agencyName = resolveString(agent.agency);
  const initials = agent.name
    ? agent.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AG";
  const titleClass = TITLE_COLORS[agent.title ?? ""] ?? TITLE_COLORS.AGENT;

  const stats = [
    {
      label: "Rating",
      value: agent.rating ?? "–",
      sub: `${agent.ratingsCount ?? 0} reviews`,
      icon: Star,
      color: "text-brand-gold",
    },
    {
      label: "Closed Deals",
      value: agent.closedDeals ?? "–",
      sub: "all time",
      icon: TrendingUp,
      color: "text-brand-blue",
    },
    {
      label: "For Sale",
      value: agent.forSaleCount ?? "–",
      sub: "listings",
      icon: Briefcase,
      color: "text-emerald-600",
    },
    {
      label: "For Rent",
      value: agent.forRentCount ?? "–",
      sub: "listings",
      icon: Award,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6 mx-auto">
      {/* ── Top navigation bar ─────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/agents?queryPage=${currentPageQuery}`)}
          className="gap-2 text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="size-4" />
          Back to Agents
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
              Edit agent
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive hover:text-destructive cursor-pointer"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-4 mr-2 text-destructive" />
              Delete agent
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Hero card ──────────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-linear-to-br from-brand-navy via-brand-navy to-[#1e3a6e]" />
        {/* Gold shimmer accent */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-brand-gold/10 blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full bg-brand-blue/20 blur-2xl translate-y-1/2" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6 p-8">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-brand-gold to-brand-blue flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {initials}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-brand-navy" />
          </div>

          {/* Identity */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                {agent.name}
              </h1>
              {agent.title && (
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${titleClass}`}
                >
                  {agent.title}
                </span>
              )}
            </div>

            <p className="text-brand-gold/90 font-medium text-sm">
              {agent.specialization}
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-1">
              {agencyName !== "–" && (
                <span className="flex items-center gap-1.5 text-white/70 text-sm">
                  <Briefcase className="size-3.5 shrink-0" />
                  {agencyName}
                </span>
              )}
              {agent.nationality && (
                <span className="flex items-center gap-1.5 text-white/70 text-sm">
                  <Globe className="size-3.5 shrink-0" />
                  {agent.nationality}
                </span>
              )}
              {agent.yearsExperience != null && (
                <span className="flex items-center gap-1.5 text-white/70 text-sm">
                  <Award className="size-3.5 shrink-0" />
                  {agent.yearsExperience} yrs experience
                </span>
              )}
            </div>
          </div>

          {/* Response time chip */}
          {agent.responseMinutes != null && (
            <div className="shrink-0 flex flex-col items-center bg-white/10 rounded-xl px-4 py-3 text-center border border-white/10">
              <span className="text-white font-bold text-lg">
                {agent.responseMinutes}&apos;
              </span>
              <span className="text-white/60 text-[10px] uppercase tracking-wider">
                Response
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Stat strip ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map(({ label, value, sub, icon: Icon, color }) => (
          <Card key={label} className="card-luxury text-center">
            <CardContent className="p-4 flex flex-col items-center gap-1">
              <Icon className={`size-4 ${color} mb-1`} />
              <span className="text-2xl font-bold text-foreground">
                {value}
              </span>
              <span className="text-xs font-medium text-foreground leading-none">
                {label}
              </span>
              <span className="text-[11px] text-muted-foreground">{sub}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Main content ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile card */}
        <Card className="card-luxury">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <User className="size-4 text-brand-blue" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-0">
            {[
              { label: "Agency", value: agencyName },
              { label: "Nationality", value: agent.nationality ?? "–" },
              { label: "Languages", value: agent.languages?.join(", ") ?? "–" },
              {
                label: "Experience since",
                value: agent.experienceSince
                  ? String(agent.experienceSince)
                  : "–",
              },
              { label: "Broker license", value: agent.brokerLicense ?? "–" },
            ].map(({ label, value }, i, arr) => (
              <div key={label}>
                <div className="flex items-center justify-between py-3">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    {label}
                  </span>
                  <span className="text-sm text-foreground font-medium text-right max-w-[60%] break-words">
                    {value}
                  </span>
                </div>
                {i < arr.length - 1 && <Separator className="opacity-50" />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Bio + deal value */}
        <div className="flex flex-col gap-4">
          {agent.bio && (
            <Card className="card-luxury flex-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BadgeCheck className="size-4 text-brand-gold" />
                  About
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {agent.bio}
                </p>
              </CardContent>
            </Card>
          )}

          {agent.totalDealsValueUsd != null && (
            <Card className="border-t-2 border-t-brand-gold bg-gradient-to-br from-brand-navy/5 to-transparent">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-brand-gold/10">
                  <TrendingUp className="size-5 text-brand-gold" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    Total Portfolio Value
                  </p>
                  <p className="text-xl font-bold text-foreground">
                    ${Number(agent.totalDealsValueUsd).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Languages as badges */}
          {agent.languages && agent.languages.length > 0 && (
            <Card className="card-luxury">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Phone className="size-4 text-brand-blue" />
                  Languages
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {agent.languages.map((lang) => (
                  <Badge key={lang} variant="secondary" className="text-xs">
                    {lang}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <DeleteAgentDialog
        agent={agent}
        open={deleteOpen}
        setOpen={setDeleteOpen}
        onClose={() => setDeleteOpen(false)}
      />

      <EditAgent agent={agent} open={editOpen} setOpen={setEditOpen} />
    </div>
  );
}

export default AgentDetail;
