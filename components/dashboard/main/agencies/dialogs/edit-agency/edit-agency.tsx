"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Loading } from "@/components/common/loading";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateAgency } from "@/lib/queries/agencies";
import { Agency } from "@/types";
import { useTranslation } from "@/hooks/use-translation";
import {
  addAgencySchema,
  AddAgencyFormValues,
  RENTAL_FOCUS_VALUES,
  COMMUNES_LIST,
  PROPERTY_TYPES_LIST,
  LANGUAGES_LIST,
} from "../create-agency/schema";

// ─── Section divider ──────────────────────────────────────────────────────────

function Section({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
        {title}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

type EditAgencyProps = {
  agency: Agency;
  open: boolean;
  setOpen: (v: boolean) => void;
};

// ─── Component ────────────────────────────────────────────────────────────────

function EditAgency({ agency, open, setOpen }: EditAgencyProps) {
  const t = useTranslation();
  const f = t.forms.agency;

  const { mutateAsync: updateAgency, isPending } = useUpdateAgency();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddAgencyFormValues>({
    resolver: zodResolver(addAgencySchema),
    defaultValues: {
      name: agency.name ?? "",
      monogram: agency.monogram ?? "",
      tagline: agency.tagline ?? "",
      email: agency.email ?? "",
      phone: agency.phone ?? "",
      whatsapp: agency.whatsapp ?? "",
      foundedYear: agency.founded ?? undefined,
      address: agency.address ?? "",
      website: agency.website ?? "",
      description: agency.description ?? "",
      communes: agency.communes ?? [],
      propertyTypes: agency.propertyTypes ?? [],
      rentalFocus: (agency.rentalFocus as AddAgencyFormValues["rentalFocus"]) ?? "BOTH",
      languages: agency.languages ?? [],
      rccmNumber: agency.rccmNumber ?? "",
      verificationDocUrl: agency.verificationDocUrl ?? "",
      logoUrl: agency.logoUrl ?? "",
      gracePeriodEndsAt: agency.gracePeriodEndsAt ? agency.gracePeriodEndsAt.substring(0, 10) : "",
      freeListingCap: agency.freeListingCap,
      verificationTier: (agency.verificationTier as AddAgencyFormValues["verificationTier"]) ?? "NON_VERIFIE",
    },
    mode: "onChange",
  });

  const { handleSubmit, control, setValue, getValues, watch } = form;

  function toggleMulti(field: "communes" | "propertyTypes" | "languages", value: string) {
    const current = getValues(field) as string[];
    setValue(
      field,
      current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
      { shouldValidate: true },
    );
  }

  const onSubmit = useCallback(
    async (values: AddAgencyFormValues) => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      try {
        const payload: Record<string, unknown> = {
          id: agency.id,
          name: values.name,
          email: values.email,
          phone: values.phone,
          whatsapp: values.whatsapp || values.phone,
          communes: values.communes,
          propertyTypes: values.propertyTypes,
          rentalFocus: values.rentalFocus,
        };
        if (values.monogram) payload.monogram = values.monogram;
        if (values.tagline) payload.tagline = values.tagline;
        if (values.languages && values.languages.length > 0) payload.languages = values.languages;
        if (values.foundedYear !== undefined) payload.founded = values.foundedYear;
        if (values.address) payload.address = values.address;
        if (values.website) payload.website = values.website;
        if (values.description) payload.description = values.description;
        if (values.rccmNumber) payload.rccmNumber = values.rccmNumber;
        if (values.verificationDocUrl) payload.verificationDocUrl = values.verificationDocUrl;
        if (values.logoUrl) payload.logoUrl = values.logoUrl;
        if (values.gracePeriodEndsAt) payload.gracePeriodEndsAt = values.gracePeriodEndsAt;
        if (values.freeListingCap !== undefined) payload.freeListingCap = values.freeListingCap;
        if (values.verificationTier) payload.verificationTier = values.verificationTier;

        await updateAgency(payload as Parameters<typeof updateAgency>[0]);
        toast.success(f.toast.updated);
        setOpen(false);
      } catch {
        toast.error(f.toast.updateFailed);
      } finally {
        setIsSubmitting(false);
      }
    },
    [updateAgency, agency.id, isSubmitting, setOpen, f],
  );

  const watchCommunes = watch("communes");
  const watchPropertyTypes = watch("propertyTypes");
  const watchLanguages = watch("languages");

  return (
    <>
      {isPending && <Loading label={f.loading.saving} />}

      <Dialog open={open} onOpenChange={setOpen}>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent className="sm:max-w-xl min-w-[850px] flex flex-col gap-4 max-h-[90vh]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {f.editTitle}
                  <span className="text-sm font-normal text-muted-foreground">— {agency.name}</span>
                </DialogTitle>
                <DialogDescription>{f.editDesc}</DialogDescription>
              </DialogHeader>

              <ScrollArea className="flex-1 overflow-y-auto pr-1">
                <div className="flex flex-col gap-4 pb-2">

                  {/* ── INFORMATIONS DE BASE ───────────────────────────── */}
                  <Section title="Informations de base" />

                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={control} name="name" render={({ field }) => (
                      <FormItem>
                        <Label>{f.labels.name} <span className="text-destructive">*</span></Label>
                        <Input {...field} placeholder={f.placeholders.name} />
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={control} name="foundedYear" render={({ field }) => (
                      <FormItem>
                        <Label>{f.labels.foundedYear}</Label>
                        <Input
                          type="number"
                          min={1900}
                          max={new Date().getFullYear()}
                          placeholder={f.placeholders.foundedYear}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={control} name="monogram" render={({ field }) => (
                      <FormItem>
                        <Label>{f.labels.monogram}</Label>
                        <Input {...field} placeholder={f.placeholders.monogram} maxLength={6} />
                        <p className="text-xs text-muted-foreground">Sigle court (max 6 caractères) — ex. BNT, ORE</p>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={control} name="tagline" render={({ field }) => (
                      <FormItem>
                        <Label>{f.labels.tagline}</Label>
                        <Input {...field} placeholder={f.placeholders.tagline} maxLength={120} />
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={control} name="email" render={({ field }) => (
                      <FormItem>
                        <Label>{f.labels.email} <span className="text-destructive">*</span></Label>
                        <Input {...field} type="email" placeholder={f.placeholders.email} />
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={control} name="phone" render={({ field }) => (
                      <FormItem>
                        <Label>{f.labels.phone} <span className="text-destructive">*</span></Label>
                        <Input {...field} type="tel" placeholder={f.placeholders.phone} />
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={control} name="whatsapp" render={({ field }) => (
                      <FormItem>
                        <Label>
                          {f.labels.whatsapp}{" "}
                          <span className="text-destructive">*</span>
                          <span className="text-xs font-normal text-muted-foreground ml-1">(canal principal)</span>
                        </Label>
                        <Input {...field} type="tel" placeholder={f.placeholders.whatsapp} />
                        <p className="text-xs text-muted-foreground">{f.placeholders.whatsappHint}</p>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={control} name="website" render={({ field }) => (
                      <FormItem>
                        <Label>{f.labels.website}</Label>
                        <Input {...field} placeholder={f.placeholders.website} />
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={control} name="address" render={({ field }) => (
                    <FormItem>
                      <Label>{f.labels.address}</Label>
                      <Input {...field} placeholder={f.placeholders.address} />
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* ── LOCALISATION & ACTIVITÉ ────────────────────────── */}
                  <Section title="Localisation & Activité" />

                  <FormField control={control} name="communes" render={() => (
                    <FormItem>
                      <Label>
                        {f.labels.communes} <span className="text-destructive">*</span>
                      </Label>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {COMMUNES_LIST.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => toggleMulti("communes", c)}
                            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                              watchCommunes?.includes(c)
                                ? "bg-primary text-white border-primary"
                                : "border-border hover:border-primary/40"
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={control} name="propertyTypes" render={() => (
                    <FormItem>
                      <Label>
                        {f.labels.propertyTypes} <span className="text-destructive">*</span>
                      </Label>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {PROPERTY_TYPES_LIST.map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => toggleMulti("propertyTypes", p)}
                            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                              watchPropertyTypes?.includes(p)
                                ? "bg-primary text-white border-primary"
                                : "border-border hover:border-primary/40"
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={control} name="languages" render={() => (
                    <FormItem>
                      <Label>{f.labels.languages}</Label>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {LANGUAGES_LIST.map((l) => (
                          <button
                            key={l}
                            type="button"
                            onClick={() => toggleMulti("languages", l)}
                            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                              watchLanguages?.includes(l)
                                ? "bg-primary text-white border-primary"
                                : "border-border hover:border-primary/40"
                            }`}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={control} name="rentalFocus" render={({ field }) => (
                    <FormItem>
                      <Label>{f.labels.rentalFocus} <span className="text-destructive">*</span></Label>
                      <div className="flex gap-3 pt-1">
                        {RENTAL_FOCUS_VALUES.map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => field.onChange(v)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                              field.value === v
                                ? "border-primary bg-primary/5 text-primary font-medium"
                                : "border-border hover:border-primary/40"
                            }`}
                          >
                            <span className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${
                              field.value === v ? "border-primary bg-primary" : "border-muted-foreground"
                            }`} />
                            {f.rentalFocusOptions[v]}
                          </button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={control} name="description" render={({ field }) => (
                    <FormItem>
                      <Label>{f.labels.description}</Label>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        rows={3}
                        placeholder={f.placeholders.description}
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        {(field.value ?? "").length} / 500
                      </p>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* ── VÉRIFICATION ──────────────────────────────────── */}
                  <Section title="Vérification (non visible publiquement)" />

                  <FormField control={control} name="rccmNumber" render={({ field }) => (
                    <FormItem>
                      <Label>
                        {f.labels.rccmNumber}
                        <span className="text-xs font-normal text-muted-foreground ml-1">(optionnel mais recommandé)</span>
                      </Label>
                      <Input {...field} placeholder={f.placeholders.rccmNumber} />
                      <p className="text-xs text-muted-foreground">
                        Numéro d&apos;enregistrement au registre du commerce DRC — confère un niveau de confiance supérieur.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={control} name="verificationDocUrl" render={({ field }) => (
                    <FormItem>
                      <Label>{f.labels.verificationDocUrl}</Label>
                      <Input {...field} placeholder={f.placeholders.verificationDocUrl} />
                      <p className="text-xs text-muted-foreground">RCCM, patente ou attestation — jamais exposé publiquement.</p>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={control} name="verificationTier" render={({ field }) => (
                    <FormItem>
                      <Label>{f.labels.verificationTier} <span className="text-destructive">*</span></Label>
                      <div className="space-y-2 pt-1">
                        {[
                          {
                            value: "NON_VERIFIE",
                            label: f.verificationRadio.pendingLabel,
                            hint: f.verificationRadio.pendingHint,
                          },
                          {
                            value: "VERIFIE",
                            label: f.verificationRadio.approvedLabel,
                            hint: f.verificationRadio.approvedHint,
                          },
                        ].map((opt) => (
                          <label
                            key={opt.value}
                            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                              field.value === opt.value
                                ? "border-primary bg-primary/5"
                                : "border-border hover:bg-muted/50"
                            }`}
                          >
                            <span className={`w-4 h-4 mt-0.5 rounded-full border-2 flex-shrink-0 ${
                              field.value === opt.value ? "border-primary bg-primary" : "border-muted-foreground"
                            }`} />
                            <div>
                              <p className="text-sm font-medium">{opt.label}</p>
                              <p className="text-xs text-muted-foreground">{opt.hint}</p>
                            </div>
                            <input
                              type="radio"
                              className="sr-only"
                              value={opt.value}
                              checked={field.value === opt.value}
                              onChange={() => field.onChange(opt.value)}
                            />
                          </label>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* ── PROFIL PUBLIC ──────────────────────────────────── */}
                  <Section title="Profil public" />

                  <FormField control={control} name="logoUrl" render={({ field }) => (
                    <FormItem>
                      <Label>{f.labels.logoUrl}</Label>
                      <Input {...field} placeholder={f.placeholders.logoUrl} />
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* ── PARAMÈTRES FREEMIUM ────────────────────────────── */}
                  <Section title="Paramètres freemium" />

                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={control} name="gracePeriodEndsAt" render={({ field }) => (
                      <FormItem>
                        <Label>{f.labels.gracePeriodEndsAt}</Label>
                        <Input {...field} type="date" />
                        <p className="text-xs text-muted-foreground">Auto-calculé : +6 mois à la création</p>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={control} name="freeListingCap" render={({ field }) => (
                      <FormItem>
                        <Label>{f.labels.freeListingCap}</Label>
                        <Input
                          type="number"
                          min={0}
                          placeholder={f.placeholders.freeListingCap}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                        <p className="text-xs text-muted-foreground">Défaut : 10 — modifiable par admin</p>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                </div>
              </ScrollArea>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  {t.forms.common.cancel}
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-primary"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isPending || isSubmitting}
                >
                  {t.forms.common.saveChanges}
                </Button>
              </DialogFooter>
            </DialogContent>
          </form>
        </Form>
      </Dialog>
    </>
  );
}

export default EditAgency;
