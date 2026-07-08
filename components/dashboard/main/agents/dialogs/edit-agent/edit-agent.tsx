"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useRef, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateAgent } from "@/lib/queries/agents";
import { useAgencies } from "@/lib/queries/agencies";
import { api } from "@/lib/api";
import { Agent } from "@/types";
import { useTranslation } from "@/hooks/use-translation";
import {
  addAgentSchema,
  AddAgentFormValues,
  AGENT_TYPE_VALUES,
  RENTAL_FOCUS_VALUES,
  VERIFICATION_TIER_VALUES,
  COMMUNES_LIST,
  PROPERTY_TYPES_LIST,
  YEARS_EXP_LIST,
} from "../create-agent/schema";

function resolveAgencyId(agency: unknown): string {
  if (!agency) return "";
  if (typeof agency === "object" && agency !== null && "id" in agency) {
    return String((agency as Record<string, unknown>).id ?? "");
  }
  return typeof agency === "string" ? agency : "";
}

type EditAgentProps = {
  agent: Agent;
  open: boolean;
  setOpen: (v: boolean) => void;
};

function EditAgent({ agent, open, setOpen }: EditAgentProps) {
  const t = useTranslation();
  const f = t.forms.agent;

  const { mutateAsync: updateAgent, isPending } = useUpdateAgent();
  const { data: agenciesData, isLoading: agenciesLoading } = useAgencies({ pageSize: 200 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string>(agent.photo ?? "");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddAgentFormValues>({
    resolver: zodResolver(addAgentSchema),
    defaultValues: {
      name: agent.name ?? "",
      email: agent.email ?? "",
      phoneNumber: agent.phoneNumber ?? "",
      whatsapp: agent.whatsappNumber ?? "",
      agentType: (agent.agentType as AddAgentFormValues["agentType"]) ?? "COMMISSIONNAIRE",
      agencyId: resolveAgencyId(agent.agency),
      communes: agent.communes ?? [],
      propertyTypes: agent.propertyTypes ?? [],
      rentalFocus: (agent.rentalFocus as AddAgentFormValues["rentalFocus"]) ?? "LONG_TERM",
      yearsExperienceLabel: agent.yearsExperienceLabel ?? "",
      idDocumentUrl: agent.idDocumentUrl ?? "",
      referredById: agent.referredById ?? "",
      verificationTier: (agent.verificationTier as AddAgentFormValues["verificationTier"]) ?? undefined,
      photo: agent.photo ?? "",
      bio: agent.bio ?? "",
      graceEndsAt: agent.graceEndsAt ? agent.graceEndsAt.substring(0, 10) : "",
      freeListingCap: agent.freeListingCap,
    },
    mode: "onChange",
  });

  const { handleSubmit, control, formState, setValue, getValues, watch } = form;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    try {
      setPhotoUploading(true);
      const { data: presigned } = await api.post<{ key: string; url: string }[]>(
        "/api/uploads/presign",
        { files: [{ filename: file.name, contentType: file.type }] },
      );
      const { key, url } = presigned[0];
      await fetch(url, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      setValue("photo", key, { shouldValidate: true });
    } catch {
      toast.error("Photo upload failed");
      setPhotoPreview(agent.photo ?? "");
      setValue("photo", agent.photo ?? "", { shouldValidate: true });
    } finally {
      setPhotoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function toggleMulti(field: "communes" | "propertyTypes", value: string) {
    const current = getValues(field) as string[];
    setValue(
      field,
      current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
      { shouldValidate: true },
    );
  }

  const onSubmit = useCallback(
    async (values: AddAgentFormValues) => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      try {
        const payload: Record<string, unknown> = {
          id: agent.id,
          name: values.name,
          email: values.email,
          phoneNumber: values.phoneNumber,
          whatsapp: values.whatsapp || values.phoneNumber,
          agentType: values.agentType,
          communes: values.communes,
          propertyTypes: values.propertyTypes,
          rentalFocus: values.rentalFocus,
        };
        if (values.agencyId) payload.agencyId = values.agencyId;
        if (values.yearsExperienceLabel) payload.yearsExperienceLabel = values.yearsExperienceLabel;
        if (values.idDocumentUrl) payload.idDocumentUrl = values.idDocumentUrl;
        if (values.referredById) payload.referredById = values.referredById;
        if (values.verificationTier) payload.verificationTier = values.verificationTier;
        if (values.photo) payload.photo = values.photo;
        if (values.bio) payload.bio = values.bio;
        if (values.graceEndsAt) payload.graceEndsAt = values.graceEndsAt;
        if (values.freeListingCap !== undefined) payload.freeListingCap = values.freeListingCap;

        await updateAgent(payload as Parameters<typeof updateAgent>[0]);
        toast.success(f.toast.updated);
        setOpen(false);
      } catch {
        toast.error(f.toast.updateFailed);
      } finally {
        setIsSubmitting(false);
      }
    },
    [updateAgent, agent.id, isSubmitting, setOpen, f],
  );

  const agencies = agenciesData?.data ?? [];
  const watchCommunes = watch("communes");
  const watchPropertyTypes = watch("propertyTypes");

  return (
    <>
      {isPending && <Loading label={f.loading.saving} />}

      <Dialog open={open} onOpenChange={setOpen}>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent className="sm:max-w-xl min-w-[950px] flex flex-col gap-4 max-h-[90vh]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {f.editTitle}
                  <span className="text-sm font-normal text-muted-foreground">— {agent.name}</span>
                </DialogTitle>
                <DialogDescription>{f.editDesc}</DialogDescription>
              </DialogHeader>

              <ScrollArea className="flex-1 overflow-y-auto pr-1">
                <div className="flex flex-col gap-4 pb-2">

                  {/* Identity */}
                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={control} name="name" render={({ field }) => (
                      <FormItem>
                        <Label>{f.labels.fullName} <span className="text-destructive">*</span></Label>
                        <Input {...field} placeholder={f.placeholders.fullName} />
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={control} name="email" render={({ field }) => (
                      <FormItem>
                        <Label>{f.labels.email} <span className="text-destructive">*</span></Label>
                        <Input {...field} type="email" placeholder={f.placeholders.email} />
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={control} name="phoneNumber" render={({ field }) => (
                      <FormItem>
                        <Label>{f.labels.phone} <span className="text-destructive">*</span></Label>
                        <Input {...field} type="tel" placeholder={f.placeholders.phone} />
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={control} name="whatsapp" render={({ field }) => (
                      <FormItem>
                        <Label>{f.labels.whatsapp}</Label>
                        <Input {...field} type="tel" placeholder={f.placeholders.whatsapp} />
                        <p className="text-xs text-muted-foreground">{f.hints.whatsappHint}</p>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  {/* Agent type */}
                  <FormField control={control} name="agentType" render={({ field }) => (
                    <FormItem>
                      <Label>{f.labels.agentType} <span className="text-destructive">*</span></Label>
                      <div className="grid grid-cols-2 gap-2">
                        {AGENT_TYPE_VALUES.map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => field.onChange(v)}
                            className={`flex items-center gap-2 p-2.5 rounded-lg border text-sm transition-colors ${
                              field.value === v
                                ? "border-primary bg-primary/5 text-primary font-medium"
                                : "border-border hover:border-primary/40"
                            }`}
                          >
                            <span className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${
                              field.value === v ? "border-primary bg-primary" : "border-muted-foreground"
                            }`} />
                            {f.agentTypes[v]}
                          </button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Agency (optional) */}
                  <FormField control={control} name="agencyId" render={({ field }) => (
                    <FormItem>
                      <Label>{f.labels.agency}</Label>
                      <Select
                          disabled={agenciesLoading}
                          onValueChange={(v) => field.onChange(v === "__none__" ? "" : v)}
                          value={field.value || "__none__"}
                        >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={agenciesLoading ? f.placeholders.loadingAgencies : f.placeholders.selectAgency} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">— {f.placeholders.selectAgency} —</SelectItem>
                          {agencies.map((a) => (
                            <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Communes */}
                  <FormField control={control} name="communes" render={() => (
                    <FormItem>
                      <Label>{f.labels.communes} <span className="text-destructive">*</span></Label>
                      <div className="flex flex-wrap gap-2">
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

                  {/* Property types */}
                  <FormField control={control} name="propertyTypes" render={() => (
                    <FormItem>
                      <Label>{f.labels.propertyTypes} <span className="text-destructive">*</span></Label>
                      <div className="flex flex-wrap gap-2">
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

                  {/* Rental focus */}
                  <FormField control={control} name="rentalFocus" render={({ field }) => (
                    <FormItem>
                      <Label>{f.labels.rentalFocus} <span className="text-destructive">*</span></Label>
                      <div className="flex gap-3">
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

                  {/* Experience */}
                  <FormField control={control} name="yearsExperienceLabel" render={({ field }) => (
                    <FormItem>
                      <Label>{f.labels.yearsExpLabel}</Label>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="—" />
                        </SelectTrigger>
                        <SelectContent>
                          {YEARS_EXP_LIST.map((y) => (
                            <SelectItem key={y} value={y}>{y}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Admin-only */}
                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={control} name="verificationTier" render={({ field }) => (
                      <FormItem>
                        <Label>{f.labels.verificationTier}</Label>
                        <Select onValueChange={field.onChange} value={field.value ?? ""}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="—" />
                          </SelectTrigger>
                          <SelectContent>
                            {VERIFICATION_TIER_VALUES.map((v) => (
                              <SelectItem key={v} value={v}>{f.verificationOptions[v]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={control} name="graceEndsAt" render={({ field }) => (
                      <FormItem>
                        <Label>{f.labels.graceEndsAt}</Label>
                        <Input {...field} type="date" />
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={control} name="referredById" render={({ field }) => (
                      <FormItem>
                        <Label>{f.labels.referredById}</Label>
                        <Input {...field} placeholder={f.placeholders.referredById} />
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  {/* Photo */}
                  <FormField control={control} name="photo" render={({ field }) => (
                    <FormItem>
                      <Label>{f.labels.photo}</Label>
                      <div className="flex items-start gap-3">
                        <div
                          className="shrink-0 w-16 h-16 rounded-lg border border-dashed border-muted-foreground/30 bg-muted flex items-center justify-center overflow-hidden cursor-pointer"
                          onClick={() => !photoUploading && fileInputRef.current?.click()}
                        >
                          {photoUploading ? (
                            <svg className="animate-spin w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                            </svg>
                          ) : photoPreview ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" onError={() => setPhotoPreview("")} />
                          ) : (
                            <span className="text-[10px] text-muted-foreground text-center px-1">{f.hints.clickToUpload}</span>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col gap-2">
                          <Input
                            {...field}
                            placeholder="https://example.com/photo.jpg"
                            disabled={photoUploading}
                            onChange={(e) => { field.onChange(e); setPhotoPreview(e.target.value); }}
                          />
                          <button
                            type="button"
                            disabled={photoUploading}
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs text-brand-blue hover:underline text-left disabled:opacity-50"
                          >
                            {photoUploading ? "Uploading…" : f.hints.orChooseFile}
                          </button>
                        </div>
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* ID document */}
                  <FormField control={control} name="idDocumentUrl" render={({ field }) => (
                    <FormItem>
                      <Label>{f.labels.idDocumentUrl}</Label>
                      <Input {...field} placeholder="https://storage.example.com/id-doc.pdf" />
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Bio */}
                  <FormField control={control} name="bio" render={({ field }) => (
                    <FormItem>
                      <Label>{f.labels.bio}</Label>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        className="h-20"
                        placeholder={f.placeholders.bio}
                      />
                      <FormMessage />
                    </FormItem>
                  )} />
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
                  disabled={isPending || photoUploading || isSubmitting}
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

export default EditAgent;
