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
import { MAX_DESCRIPTION_LENGTH } from "@/constants";
import { useUpdateAgent } from "@/lib/queries/agents";
import { useAgencies } from "@/lib/queries/agencies";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Agent } from "@/types";
import { useTranslation } from "@/hooks/use-translation";
import { addAgentSchema, AddAgentFormValues } from "../create-agent/schema";
import { AGENT_SPECIALIZATIONS } from "../create-agent/constants";

const AGENT_TITLES = ["SUPERAGENT", "AGENT EXCLUSIF", "AGENT"] as const;
const currentYear = new Date().getFullYear();

const PHOTO_GRADIENT_OPTIONS = [
  { label: "Blue Sky",     value: "from-blue-400 to-blue-600" },
  { label: "Navy Night",   value: "from-slate-700 to-slate-900" },
  { label: "Gold Sunrise", value: "from-amber-400 to-orange-600" },
  { label: "Purple Dusk",  value: "from-purple-400 to-purple-700" },
  { label: "Emerald",      value: "from-emerald-400 to-emerald-700" },
  { label: "Rose",         value: "from-rose-400 to-rose-700" },
  { label: "Indigo",       value: "from-indigo-400 to-indigo-700" },
  { label: "Teal",         value: "from-teal-400 to-teal-600" },
  { label: "Crimson",      value: "from-red-400 to-red-700" },
  { label: "Charcoal",     value: "from-gray-500 to-gray-800" },
] as const;

const ACCENT_CLASSES = [
  { label: "Blue",   value: "bg-blue-600" },
  { label: "Green",  value: "bg-green-600" },
  { label: "Purple", value: "bg-purple-600" },
  { label: "Red",    value: "bg-red-600" },
  { label: "Orange", value: "bg-orange-600" },
  { label: "Indigo", value: "bg-indigo-600" },
  { label: "Teal",   value: "bg-teal-600" },
  { label: "Pink",   value: "bg-pink-600" },
  { label: "Yellow", value: "bg-yellow-600" },
  { label: "Gray",   value: "bg-gray-700" },
] as const;

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

  // Photo upload state — seed preview with current photo
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string>(agent.photo ?? "");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddAgentFormValues>({
    resolver: zodResolver(addAgentSchema),
    defaultValues: {
      agencyId: resolveAgencyId(agent.agency),
      name: agent.name ?? "",
      title: agent.title ?? "AGENT",
      specialization: agent.specialization ?? "",
      nationality: agent.nationality ?? "",
      languages: Array.isArray(agent.languages) ? agent.languages.join(", ") : (agent.languages ?? ""),
      yearsExperience: agent.yearsExperience ?? 0,
      experienceSince: agent.experienceSince ?? currentYear,
      rating: agent.rating ?? 0,
      ratingsCount: agent.ratingsCount ?? 0,
      responseMinutes: agent.responseMinutes ?? 0,
      brokerLicense: agent.brokerLicense ?? "",
      bio: agent.bio ?? "",
      photo: agent.photo ?? "",
      photoGradient: agent.photoGradient ?? "",
      agencyAccent: agent.agencyAccent ?? "",
      agencyMonogram: agent.agencyMonogram ?? "",
    },
    mode: "onChange",
  });

  const { handleSubmit, control, formState, setValue } = form;

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

  const onSubmit = useCallback(
    async (values: AddAgentFormValues) => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      try {
        const payload = {
          ...values,
          id: agent.id,
          languages: values.languages.split(",").map((s) => s.trim()).filter(Boolean),
        };
        await updateAgent(payload);
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

                  {/* Agency */}
                  <FormField
                    control={control}
                    name="agencyId"
                    render={({ field }) => (
                      <FormItem>
                        <Label>{f.labels.agency} <span className="text-destructive">*</span></Label>
                        <Select
                          disabled={agenciesLoading}
                          onValueChange={(value) => {
                            field.onChange(value);
                            const agency = agencies.find((a) => a.id === value);
                            if (agency) {
                              setValue("agencyAccent", agency.accentClass, { shouldValidate: true });
                              setValue("agencyMonogram", agency.monogram, { shouldValidate: true });
                            }
                          }}
                          value={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={agenciesLoading ? f.placeholders.loadingAgencies : f.placeholders.selectAgency} />
                          </SelectTrigger>
                          <SelectContent>
                            {agencies.map((a) => (
                              <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Identity */}
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <Label>{f.labels.fullName} <span className="text-destructive">*</span></Label>
                          <Input {...field} placeholder={f.placeholders.fullName} />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <Label>{f.labels.title} <span className="text-destructive">*</span></Label>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {AGENT_TITLES.map((title) => (
                                <SelectItem key={title} value={title}>{title}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Specialization — dropdown */}
                    <FormField
                      control={control}
                      name="specialization"
                      render={({ field }) => (
                        <FormItem>
                          <Label>{f.labels.specialization} <span className="text-destructive">*</span></Label>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={f.placeholders.specialization} />
                            </SelectTrigger>
                            <SelectContent>
                              {AGENT_SPECIALIZATIONS.map(({ label, value }) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="nationality"
                      render={({ field }) => (
                        <FormItem>
                          <Label>{f.labels.nationality} <span className="text-destructive">*</span></Label>
                          <Input {...field} placeholder={f.placeholders.nationality} />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={control}
                    name="languages"
                    render={({ field }) => (
                      <FormItem>
                        <Label>{f.labels.languages} <span className="text-destructive">*</span></Label>
                        <Input {...field} placeholder={f.placeholders.languages} />
                        <p className="text-xs text-muted-foreground">{f.hints.separateWithCommas}</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="brokerLicense"
                    render={({ field }) => (
                      <FormItem>
                        <Label>{f.labels.brokerLicense} <span className="text-destructive">*</span></Label>
                        <Input {...field} placeholder={f.placeholders.brokerLicense} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <FormField
                      control={control}
                      name="yearsExperience"
                      render={({ field }) => (
                        <FormItem>
                          <Label>{f.labels.yearsExp} <span className="text-destructive">*</span></Label>
                          <Input {...field} type="number" min={0} placeholder="5"
                            onChange={(e) => field.onChange(Number(e.target.value))} />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="experienceSince"
                      render={({ field }) => (
                        <FormItem>
                          <Label>{f.labels.since} <span className="text-destructive">*</span></Label>
                          <Input {...field} type="number" min={1900} max={currentYear} placeholder="2019"
                            onChange={(e) => field.onChange(Number(e.target.value))} />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="responseMinutes"
                      render={({ field }) => (
                        <FormItem>
                          <Label>{f.labels.responseMin} <span className="text-destructive">*</span></Label>
                          <Input {...field} type="number" min={0} placeholder="30"
                            onChange={(e) => field.onChange(Number(e.target.value))} />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={control}
                      name="rating"
                      render={({ field }) => (
                        <FormItem>
                          <Label>{f.labels.rating} <span className="text-destructive">*</span></Label>
                          <Input {...field} type="number" min={0} max={5} step={0.1} placeholder="4.8"
                            onChange={(e) => field.onChange(Number(e.target.value))} />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="ratingsCount"
                      render={({ field }) => (
                        <FormItem>
                          <Label>{f.labels.ratingsCount} <span className="text-destructive">*</span></Label>
                          <Input {...field} type="number" min={0} placeholder="120"
                            onChange={(e) => field.onChange(Number(e.target.value))} />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Photo */}
                  <FormField
                    control={control}
                    name="photo"
                    render={({ field }) => (
                      <FormItem>
                        <Label>{f.labels.photo} <span className="text-destructive">*</span></Label>
                        <div className="flex items-start gap-3">
                          {/* Thumbnail / spinner */}
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
                              <img
                                src={photoPreview}
                                alt="Photo preview"
                                className="w-full h-full object-cover"
                                onError={() => setPhotoPreview("")}
                              />
                            ) : (
                              <span className="text-[10px] text-muted-foreground text-center px-1">
                                {f.hints.clickToUpload}
                              </span>
                            )}
                          </div>

                          {/* URL input + upload button */}
                          <div className="flex-1 flex flex-col gap-2">
                            <Input
                              {...field}
                              placeholder="https://example.com/photo.jpg"
                              disabled={photoUploading}
                              onChange={(e) => {
                                field.onChange(e);
                                setPhotoPreview(e.target.value);
                              }}
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
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="photoGradient"
                    render={({ field }) => (
                      <FormItem>
                        <Label>{f.labels.photoGradient} <span className="text-destructive">*</span></Label>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="w-full">
                            <div className="flex items-center gap-2 min-w-0">
                              {field.value && (
                                <span className={cn("inline-block shrink-0 w-12 h-4 rounded-sm bg-linear-to-r", field.value)} />
                              )}
                              <SelectValue placeholder={f.placeholders.selectGradient} />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {PHOTO_GRADIENT_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                <div className="flex items-center gap-2">
                                  <span className={cn("inline-block w-12 h-4 rounded-sm bg-linear-to-r shrink-0", opt.value)} />
                                  {opt.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={control}
                      name="agencyAccent"
                      render={({ field }) => (
                        <FormItem>
                          <Label>{f.labels.agencyAccent} <span className="text-destructive">*</span></Label>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="w-full">
                              <div className="flex items-center gap-2 min-w-0">
                                {field.value && (
                                  <span className={cn("inline-block shrink-0 w-3 h-3 rounded-full", field.value)} />
                                )}
                                <SelectValue placeholder={f.placeholders.selectAccent} />
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              {ACCENT_CLASSES.map(({ label, value }) => (
                                <SelectItem key={value} value={value}>
                                  <span className={cn("inline-block w-3 h-3 rounded-full mr-2", value)} />
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">{f.hints.autoFilledFromAgency}</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="agencyMonogram"
                      render={({ field }) => (
                        <FormItem>
                          <Label>{f.labels.agencyMonogram} <span className="text-destructive">*</span></Label>
                          <Input {...field} placeholder="CB" />
                          <p className="text-xs text-muted-foreground">{f.hints.autoFilledFromAgency}</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Bio */}
                  <FormField
                    control={control}
                    name="bio"
                    render={({ field }) => {
                      const len = field.value?.length ?? 0;
                      const exceeded = len > MAX_DESCRIPTION_LENGTH;
                      return (
                        <FormItem>
                          <Label>{f.labels.bio} <span className="text-destructive">*</span></Label>
                          <Textarea
                            {...field}
                            value={field.value ?? ""}
                            className={cn("h-24", { "border-destructive": exceeded })}
                            placeholder={f.placeholders.bio}
                          />
                          <div className="flex justify-end">
                            <span className={cn("text-muted-foreground text-xs", { "text-destructive": exceeded })}>
                              {len}/{MAX_DESCRIPTION_LENGTH}
                            </span>
                          </div>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
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
                  disabled={!formState.isValid || isPending || photoUploading || isSubmitting}
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
