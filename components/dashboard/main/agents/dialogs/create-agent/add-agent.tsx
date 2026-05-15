"use client";

import { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

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
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import DialogDiscard from "@/components/common/discard";
import { Loading } from "@/components/common/loading";
import { cn } from "@/lib/utils";
import { MAX_DESCRIPTION_LENGTH } from "@/constants";
import { useCreateAgent } from "@/lib/queries/agents";
import { useAgencies } from "@/lib/queries/agencies";
import { addAgentSchema, AddAgentFormValues } from "./schema";

const AGENT_TITLES = ["SUPERAGENT", "AGENT EXCLUSIF", "AGENT"] as const;
const currentYear = new Date().getFullYear();

const PHOTO_GRADIENT_OPTIONS = [
  { label: "Blue Sky", value: "from-blue-400 to-blue-600" },
  { label: "Navy Night", value: "from-slate-700 to-slate-900" },
  { label: "Gold Sunrise", value: "from-amber-400 to-orange-600" },
  { label: "Purple Dusk", value: "from-purple-400 to-purple-700" },
  { label: "Emerald", value: "from-emerald-400 to-emerald-700" },
  { label: "Rose", value: "from-rose-400 to-rose-700" },
  { label: "Indigo", value: "from-indigo-400 to-indigo-700" },
  { label: "Teal", value: "from-teal-400 to-teal-600" },
  { label: "Crimson", value: "from-red-400 to-red-700" },
  { label: "Charcoal", value: "from-gray-500 to-gray-800" },
] as const;

const ACCENT_CLASSES = [
  { label: "Blue", value: "bg-blue-600" },
  { label: "Green", value: "bg-green-600" },
  { label: "Purple", value: "bg-purple-600" },
  { label: "Red", value: "bg-red-600" },
  { label: "Orange", value: "bg-orange-600" },
  { label: "Indigo", value: "bg-indigo-600" },
  { label: "Teal", value: "bg-teal-600" },
  { label: "Pink", value: "bg-pink-600" },
  { label: "Yellow", value: "bg-yellow-600" },
  { label: "Gray", value: "bg-gray-700" },
] as const;

type AddAgentProps = {
  open: boolean;
  resetCurrentPage?: () => void;
  setToggle: (open: boolean) => void;
};

function AddAgent({ open, setToggle, resetCurrentPage }: AddAgentProps) {
  const { mutateAsync: createAgent, isPending } = useCreateAgent();
  const { data: agenciesData, isLoading: agenciesLoading } = useAgencies({ pageSize: 200 });
  const [openDiscard, setOpenDiscard] = useState(false);

  const form = useForm<AddAgentFormValues>({
    resolver: zodResolver(addAgentSchema),
    defaultValues: {
      agencyId: "",
      name: "",
      title: "AGENT",
      specialization: "",
      nationality: "",
      languages: "",
      yearsExperience: 0,
      experienceSince: currentYear,
      rating: 0,
      ratingsCount: 0,
      responseMinutes: 0,
      brokerLicense: "",
      bio: "",
      photo: "",
      photoGradient: "",
      agencyAccent: "",
      agencyMonogram: "",
    },
    mode: "onChange",
  });

  const { reset, handleSubmit, control, watch, formState, setValue } = form;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPhotoPreview(dataUrl);
      setValue("photo", dataUrl, { shouldValidate: true });
    };
    reader.readAsDataURL(file);
  }

  const onSubmit = useCallback(
    async (values: AddAgentFormValues) => {
      try {
        const payload = {
          ...values,
          languages: values.languages
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        };
        await createAgent(payload);
        toast.success("Agent created successfully");
        reset();
        setPhotoPreview("");
        setToggle(false);
        resetCurrentPage?.();
      } catch {
        toast.error("Failed to create agent. Please try again.");
      }
    },
    [createAgent, reset, setToggle, resetCurrentPage],
  );

  function handleDialogChange(nextOpen: boolean) {
    if (formState.isDirty || watch("name")) {
      setOpenDiscard(true);
      return;
    }
    setToggle(nextOpen);
  }

  function handleDiscard() {
    reset();
    setPhotoPreview("");
    setToggle(false);
    setOpenDiscard(false);
  }

  const agencies = agenciesData?.data ?? [];

  return (
    <>
      {isPending ? (
        <Loading label="Creating agent" />
      ) : (
        <Dialog open={open} onOpenChange={handleDialogChange}>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogContent className="sm:max-w-xl min-w-[850px] flex flex-col gap-4 max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>Add Agent</DialogTitle>
                  <DialogDescription>
                    Fill in all details to create a new agent.
                  </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 overflow-y-auto pr-1">
                  <div className="flex flex-col gap-4 pb-2">
                    {/* Agency dropdown */}
                    <FormField
                      control={control}
                      name="agencyId"
                      render={({ field }) => (
                        <FormItem>
                          <Label>
                            Agency <span className="text-destructive">*</span>
                          </Label>
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
                              <SelectValue
                                placeholder={
                                  agenciesLoading ? "Loading agencies…" : "Select an agency"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {agencies.map((agency) => (
                                <SelectItem key={agency.id} value={agency.id}>
                                  {agency.name}
                                </SelectItem>
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
                            <Label>
                              Full name <span className="text-destructive">*</span>
                            </Label>
                            <Input {...field} placeholder="John Smith" />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <Label>
                              Title <span className="text-destructive">*</span>
                            </Label>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {AGENT_TITLES.map((t) => (
                                  <SelectItem key={t} value={t}>
                                    {t}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={control}
                        name="specialization"
                        render={({ field }) => (
                          <FormItem>
                            <Label>
                              Specialization <span className="text-destructive">*</span>
                            </Label>
                            <Input {...field} placeholder="Residential" />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="nationality"
                        render={({ field }) => (
                          <FormItem>
                            <Label>
                              Nationality <span className="text-destructive">*</span>
                            </Label>
                            <Input {...field} placeholder="French" />
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
                          <Label>
                            Languages <span className="text-destructive">*</span>
                          </Label>
                          <Input {...field} placeholder="English, French, Arabic" />
                          <p className="text-xs text-muted-foreground">Separate with commas</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="brokerLicense"
                      render={({ field }) => (
                        <FormItem>
                          <Label>
                            Broker license <span className="text-destructive">*</span>
                          </Label>
                          <Input {...field} placeholder="BRN-123456" />
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
                            <Label>
                              Years exp. <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              {...field}
                              type="number"
                              min={0}
                              placeholder="5"
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="experienceSince"
                        render={({ field }) => (
                          <FormItem>
                            <Label>
                              Since (year) <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              {...field}
                              type="number"
                              min={1900}
                              max={currentYear}
                              placeholder="2019"
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="responseMinutes"
                        render={({ field }) => (
                          <FormItem>
                            <Label>
                              Response (min) <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              {...field}
                              type="number"
                              min={0}
                              placeholder="30"
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
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
                            <Label>
                              Rating (0–5) <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              {...field}
                              type="number"
                              min={0}
                              max={5}
                              step={0.1}
                              placeholder="4.8"
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="ratingsCount"
                        render={({ field }) => (
                          <FormItem>
                            <Label>
                              Ratings count <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              {...field}
                              type="number"
                              min={0}
                              placeholder="120"
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Media */}
                    <FormField
                      control={control}
                      name="photo"
                      render={({ field }) => (
                        <FormItem>
                          <Label>
                            Photo <span className="text-destructive">*</span>
                          </Label>
                          <div className="flex items-start gap-3">
                            {/* Preview */}
                            <div
                              className="shrink-0 w-16 h-16 rounded-lg border border-dashed border-muted-foreground/30 bg-muted flex items-center justify-center overflow-hidden cursor-pointer"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              {(photoPreview || field.value) ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={photoPreview || field.value}
                                  alt="Photo preview"
                                  className="w-full h-full object-cover"
                                  onError={() => setPhotoPreview("")}
                                />
                              ) : (
                                <span className="text-[10px] text-muted-foreground text-center px-1">
                                  Click to upload
                                </span>
                              )}
                            </div>
                            <div className="flex-1 flex flex-col gap-2">
                              <Input
                                {...field}
                                placeholder="https://example.com/photo.jpg"
                                onChange={(e) => {
                                  field.onChange(e);
                                  setPhotoPreview("");
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-xs text-brand-blue hover:underline text-left"
                              >
                                Or choose a file…
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
                          <Label>
                            Photo gradient <span className="text-destructive">*</span>
                          </Label>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="w-full">
                              <div className="flex items-center gap-2 min-w-0">
                                {field.value && (
                                  <span
                                    className={cn(
                                      "inline-block shrink-0 w-12 h-4 rounded-sm bg-linear-to-r",
                                      field.value,
                                    )}
                                  />
                                )}
                                <SelectValue placeholder="Select a gradient" />
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              {PHOTO_GRADIENT_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={cn(
                                        "inline-block w-12 h-4 rounded-sm bg-linear-to-r shrink-0",
                                        opt.value,
                                      )}
                                    />
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
                            <Label>
                              Agency accent <span className="text-destructive">*</span>
                            </Label>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="w-full">
                                <div className="flex items-center gap-2 min-w-0">
                                  {field.value && (
                                    <span
                                      className={cn(
                                        "inline-block shrink-0 w-3 h-3 rounded-full",
                                        field.value,
                                      )}
                                    />
                                  )}
                                  <SelectValue placeholder="Select accent" />
                                </div>
                              </SelectTrigger>
                              <SelectContent>
                                {ACCENT_CLASSES.map(({ label, value }) => (
                                  <SelectItem key={value} value={value}>
                                    <span
                                      className={cn("inline-block w-3 h-3 rounded-full mr-2", value)}
                                    />
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">Auto-filled from agency</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="agencyMonogram"
                        render={({ field }) => (
                          <FormItem>
                            <Label>
                              Agency monogram <span className="text-destructive">*</span>
                            </Label>
                            <Input {...field} placeholder="CB" />
                            <p className="text-xs text-muted-foreground">Auto-filled from agency</p>
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
                            <Label>
                              Bio <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                              {...field}
                              value={field.value ?? ""}
                              className={cn("h-24", { "border-destructive": exceeded })}
                              placeholder="Short professional bio"
                            />
                            <div className="flex justify-end">
                              <span
                                className={cn("text-muted-foreground text-xs", {
                                  "text-destructive": exceeded,
                                })}
                              >
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleDialogChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-primary"
                    onClick={handleSubmit(onSubmit)}
                    disabled={!formState.isValid || isPending}
                  >
                    Create Agent
                  </Button>
                </DialogFooter>
              </DialogContent>
            </form>
          </Form>
        </Dialog>
      )}

      <DialogDiscard
        open={openDiscard}
        title="Discard changes?"
        onDiscard={handleDiscard}
        onOpenChange={setOpenDiscard}
        onClose={() => setOpenDiscard(false)}
        description="You've entered details that haven't been saved. Closing now will remove them."
      />
    </>
  );
}

export default AddAgent;
