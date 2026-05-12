"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import DialogDiscard from "@/components/common/discard";
import { InfiniteCombobox } from "@/components/common/infinite-combobox";
import { Loading } from "@/components/common/loading";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { MAX_DESCRIPTION_LENGTH } from "@/constants";
import { useAgencies } from "@/lib/queries/agencies";
import { useAgents } from "@/lib/queries/agents";
import { useCreateProperty } from "@/lib/queries/properties";
import { Agency } from "@/types";
import { Agent } from "@/types";
import { cn } from "@/lib/utils";
import { AddPropertyFormValues, addPropertySchema } from "./schema";

// ─── Infinite-scroll hooks for dropdowns ─────────────────────────────────────

const DROPDOWN_PAGE_SIZE = 30;

function useInfiniteAgencies() {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Agency[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { data, isLoading } = useAgencies({ page, pageSize: DROPDOWN_PAGE_SIZE });

  useEffect(() => {
    if (!data?.data) return;
    setItems((prev) =>
      page === 1 ? data.data : [...prev, ...data.data],
    );
    setIsLoadingMore(false);
  }, [data, page]);

  const totalCount = data?.totalCount ?? 0;
  const hasMore = items.length < totalCount;

  function loadMore() {
    if (hasMore && !isLoadingMore) {
      setIsLoadingMore(true);
      setPage((p) => p + 1);
    }
  }

  return {
    items,
    isLoading: isLoading && page === 1,
    isLoadingMore,
    hasMore,
    loadMore,
  };
}

function useInfiniteAgents() {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Agent[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { data, isLoading } = useAgents({ page, pageSize: DROPDOWN_PAGE_SIZE });

  useEffect(() => {
    if (!data?.data) return;
    setItems((prev) =>
      page === 1 ? data.data : [...prev, ...data.data],
    );
    setIsLoadingMore(false);
  }, [data, page]);

  const totalCount = data?.totalCount ?? 0;
  const hasMore = items.length < totalCount;

  function loadMore() {
    if (hasMore && !isLoadingMore) {
      setIsLoadingMore(true);
      setPage((p) => p + 1);
    }
  }

  return {
    items,
    isLoading: isLoading && page === 1,
    isLoadingMore,
    hasMore,
    loadMore,
  };
}

// ─── Constants ───────────────────────────────────────────────────────────────

const LISTING_TYPES = ["rent", "sale", "commercial"] as const;
const CATEGORIES = [
  "apartment", "villa", "townhouse", "studio", "duplex",
  "penthouse", "land", "office", "warehouse", "retail",
] as const;
const ICON_TYPES = ["building", "home", "land", "office", "store", "warehouse"] as const;
const PERIODS = ["monthly", "yearly"] as const;
const TRANSACTIONS = ["rent", "sale"] as const;

const STEPS = [
  { label: "Assignment",      description: "Agency & agent"       },
  { label: "Listing Details", description: "Type, category & pricing" },
  { label: "Location",        description: "Address & specs"       },
  { label: "Media & Features",description: "Visuals & amenities"  },
  { label: "Legal & Market",  description: "Optional details"     },
];

// Required fields that must pass validation before advancing each step
const STEP_REQUIRED_FIELDS: Array<(keyof AddPropertyFormValues)[]> = [
  ["agencyId", "agentId"],
  ["listingType", "category", "iconType", "title", "subtitle", "price", "currency"],
  ["city", "suburb", "neighborhood", "bedrooms", "bathrooms", "areaSqm"],
  ["imageGradient", "amenities"],
  [], // all optional on step 5
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function splitTrim(val: string): string[] {
  return val.split(",").map((s) => s.trim()).filter(Boolean);
}

// ─── Step Indicator ──────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center select-none">
      {STEPS.map((s, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all duration-200",
                i < current
                  ? "bg-brand-navy border-brand-navy text-white"
                  : i === current
                  ? "bg-brand-blue border-brand-blue text-white"
                  : "bg-background border-border text-muted-foreground",
              )}
            >
              {i < current ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span
              className={cn(
                "text-[10px] font-medium whitespace-nowrap",
                i === current ? "text-brand-blue" : "text-muted-foreground",
              )}
            >
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={cn(
                "h-0.5 w-10 mb-4 mx-1 transition-all duration-300",
                i < current ? "bg-brand-navy" : "bg-border",
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Props ───────────────────────────────────────────────────────────────────

type AddPropertyProps = {
  open: boolean;
  resetCurrentPage?: () => void;
  setToggle: (open: boolean) => void;
};

// ─── Main Component ──────────────────────────────────────────────────────────

function AddProperty({ open, setToggle, resetCurrentPage }: AddPropertyProps) {
  const { mutateAsync: createProperty, isPending } = useCreateProperty();
  const agencies = useInfiniteAgencies();
  const agentsDropdown = useInfiniteAgents();

  const [step, setStep] = useState(0);
  const [openDiscard, setOpenDiscard] = useState(false);

  const form = useForm<AddPropertyFormValues>({
    resolver: zodResolver(addPropertySchema),
    defaultValues: {
      agentId: "",
      agencyId: "",
      listingType: "sale",
      category: "apartment",
      price: 0,
      currency: "USD",
      period: "",
      title: "",
      subtitle: "",
      bedrooms: 0,
      bathrooms: 0,
      areaSqm: 0,
      suburb: "",
      neighborhood: "",
      city: "",
      verified: false,
      premium: false,
      isNew: false,
      imageGradient: "",
      iconType: "home",
      transaction: "",
      gallery: "",
      amenities: "",
      description: "",
      reference: "",
      zone: "",
      brokerLicense: "",
      agentLicense: "",
      permitNumber: "",
      availableFrom: "",
      averagePriceArea: undefined,
      averageSizeArea: undefined,
    },
    mode: "onChange",
  });

  const { reset, handleSubmit, control, watch, formState } = form;

  // ── Navigation ──────────────────────────────────────────────────────────────

  async function handleNext() {
    const fields = STEP_REQUIRED_FIELDS[step];
    if (fields.length > 0) {
      const valid = await form.trigger(fields);
      if (!valid) return;
    }
    setStep((s) => s + 1);
  }

  function handleBack() {
    setStep((s) => s - 1);
  }

  function handleDialogChange(nextOpen: boolean) {
    if (!nextOpen && (formState.isDirty || watch("title"))) {
      setOpenDiscard(true);
      return;
    }
    if (!nextOpen) setStep(0);
    setToggle(nextOpen);
  }

  function handleDiscard() {
    reset();
    setStep(0);
    setToggle(false);
    setOpenDiscard(false);
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  const onSubmit = useCallback(
    async (values: AddPropertyFormValues) => {
      try {
        const payload = {
          ...values,
          period:        values.period        || undefined,
          transaction:   values.transaction   || undefined,
          gallery:       values.gallery ? splitTrim(values.gallery) : [],
          amenities:     splitTrim(values.amenities),
          description:   values.description   || undefined,
          reference:     values.reference     || undefined,
          zone:          values.zone          || undefined,
          brokerLicense: values.brokerLicense || undefined,
          agentLicense:  values.agentLicense  || undefined,
          permitNumber:  values.permitNumber  || undefined,
          availableFrom: values.availableFrom || undefined,
        };
        await createProperty(payload);
        toast.success("Property created successfully");
        reset();
        setStep(0);
        setToggle(false);
        resetCurrentPage?.();
      } catch {
        toast.error("Failed to create property. Please try again.");
      }
    },
    [createProperty, reset, setToggle, resetCurrentPage],
  );


  const isLastStep = step === STEPS.length - 1;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {isPending && <Loading label="Creating property" />}

      <Dialog open={open} onOpenChange={handleDialogChange}>
        <DialogContent className="sm:max-w-[580px] p-0 gap-0 overflow-hidden">
          <Form {...form}>
            {/*
              IMPORTANT: <form> must be INSIDE <DialogContent> so the submit
              button and the form share the same DOM subtree (portal context).
            */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
              {/* Header */}
              <div className="px-6 pt-6 pb-4 flex flex-col gap-1 border-b">
                <DialogHeader>
                  <DialogTitle>Add Property</DialogTitle>
                  <DialogDescription>
                    {STEPS[step].description} — step {step + 1} of {STEPS.length}
                  </DialogDescription>
                </DialogHeader>
              </div>

              {/* Step indicator */}
              <div className="px-6 pt-5 pb-3">
                <StepIndicator current={step} />
              </div>

              {/* Step content */}
              <div className="px-6 pb-4 min-h-[280px] flex flex-col gap-4">

                {/* ── Step 1: Assignment ──────────────────────────────── */}
                {step === 0 && (
                  <>
                    <FormField
                      control={control}
                      name="agencyId"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Agency <span className="text-destructive">*</span></Label>
                          <InfiniteCombobox
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select agency"
                            searchPlaceholder="Search agencies…"
                            items={agencies.items}
                            isLoading={agencies.isLoading}
                            isLoadingMore={agencies.isLoadingMore}
                            hasMore={agencies.hasMore}
                            onLoadMore={agencies.loadMore}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="agentId"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Agent <span className="text-destructive">*</span></Label>
                          <InfiniteCombobox
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select agent"
                            searchPlaceholder="Search agents…"
                            items={agentsDropdown.items}
                            isLoading={agentsDropdown.isLoading}
                            isLoadingMore={agentsDropdown.isLoadingMore}
                            hasMore={agentsDropdown.hasMore}
                            onLoadMore={agentsDropdown.loadMore}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {/* ── Step 2: Listing Details ─────────────────────────── */}
                {step === 1 && (
                  <>
                    <FormField
                      control={control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Title <span className="text-destructive">*</span></Label>
                          <Input {...field} placeholder="Luxury 3-Bed Apartment" />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="subtitle"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Subtitle <span className="text-destructive">*</span></Label>
                          <Input {...field} placeholder="Sea-view in Downtown Marina" />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <FormField
                        control={control}
                        name="listingType"
                        render={({ field }) => (
                          <FormItem>
                            <Label>Listing type <span className="text-destructive">*</span></Label>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {LISTING_TYPES.map((t) => (
                                  <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <Label>Category <span className="text-destructive">*</span></Label>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {CATEGORIES.map((c) => (
                                  <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="iconType"
                        render={({ field }) => (
                          <FormItem>
                            <Label>Icon <span className="text-destructive">*</span></Label>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {ICON_TYPES.map((t) => (
                                  <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <FormField
                        control={control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <Label>Price <span className="text-destructive">*</span></Label>
                            <Input
                              {...field}
                              type="number"
                              min={0}
                              placeholder="500000"
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <Label>Currency <span className="text-destructive">*</span></Label>
                            <Input {...field} placeholder="USD" />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="period"
                        render={({ field }) => (
                          <FormItem>
                            <Label>Period</Label>
                            <Select
                              onValueChange={(val) => field.onChange(val === "__none__" ? "" : val)}
                              value={field.value || "__none__"}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">None</SelectItem>
                                {PERIODS.map((p) => (
                                  <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}

                {/* ── Step 3: Location & Specs ────────────────────────── */}
                {step === 2 && (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <FormField
                        control={control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <Label>City <span className="text-destructive">*</span></Label>
                            <Input {...field} placeholder="Dubai" />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="suburb"
                        render={({ field }) => (
                          <FormItem>
                            <Label>Suburb <span className="text-destructive">*</span></Label>
                            <Input {...field} placeholder="Marina" />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="neighborhood"
                        render={({ field }) => (
                          <FormItem>
                            <Label>Neighborhood <span className="text-destructive">*</span></Label>
                            <Input {...field} placeholder="Palm Jumeirah" />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <FormField
                        control={control}
                        name="bedrooms"
                        render={({ field }) => (
                          <FormItem>
                            <Label>Bedrooms <span className="text-destructive">*</span></Label>
                            <Input
                              {...field}
                              type="number"
                              min={0}
                              placeholder="3"
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="bathrooms"
                        render={({ field }) => (
                          <FormItem>
                            <Label>Bathrooms <span className="text-destructive">*</span></Label>
                            <Input
                              {...field}
                              type="number"
                              min={0}
                              placeholder="2"
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="areaSqm"
                        render={({ field }) => (
                          <FormItem>
                            <Label>Area (m²) <span className="text-destructive">*</span></Label>
                            <Input
                              {...field}
                              type="number"
                              min={0}
                              step={0.1}
                              placeholder="120"
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}

                {/* ── Step 4: Media & Features ────────────────────────── */}
                {step === 3 && (
                  <>
                    <FormField
                      control={control}
                      name="imageGradient"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Image gradient <span className="text-destructive">*</span></Label>
                          <Input {...field} placeholder="from-blue-400 to-blue-700" />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="gallery"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Gallery URLs</Label>
                          <Input {...field} placeholder="https://img1.jpg, https://img2.jpg" />
                          <p className="text-xs text-muted-foreground">Separate with commas</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="amenities"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Amenities <span className="text-destructive">*</span></Label>
                          <Input {...field} placeholder="Pool, Gym, Parking, Concierge" />
                          <p className="text-xs text-muted-foreground">Separate with commas</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={control}
                        name="transaction"
                        render={({ field }) => (
                          <FormItem>
                            <Label>Transaction</Label>
                            <Select
                              onValueChange={(val) => field.onChange(val === "__none__" ? "" : val)}
                              value={field.value || "__none__"}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">None</SelectItem>
                                {TRANSACTIONS.map((t) => (
                                  <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex items-end gap-4 pb-1">
                        {(
                          [
                            { name: "verified", label: "Verified" },
                            { name: "premium",  label: "Premium"  },
                            { name: "isNew",    label: "New"      },
                          ] as const
                        ).map(({ name, label }) => (
                          <FormField
                            key={name}
                            control={control}
                            name={name}
                            render={({ field }) => (
                              <FormItem className="flex items-center gap-2 space-y-0">
                                <Checkbox
                                  id={name}
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                                <Label htmlFor={name} className="text-sm font-normal cursor-pointer">
                                  {label}
                                </Label>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <FormField
                      control={control}
                      name="description"
                      render={({ field }) => {
                        const len = field.value?.length ?? 0;
                        const exceeded = len > MAX_DESCRIPTION_LENGTH;
                        return (
                          <FormItem>
                            <Label>Description</Label>
                            <Textarea
                              {...field}
                              value={field.value ?? ""}
                              className={cn("h-20", { "border-destructive": exceeded })}
                              placeholder="Describe the property (optional)"
                            />
                            <div className="flex justify-end">
                              <span className={cn("text-muted-foreground text-xs", { "text-destructive": exceeded })}>
                                {len}/{MAX_DESCRIPTION_LENGTH}
                              </span>
                            </div>
                          </FormItem>
                        );
                      }}
                    />
                  </>
                )}

                {/* ── Step 5: Legal & Market ──────────────────────────── */}
                {step === 4 && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={control}
                        name="reference"
                        render={({ field }) => (
                          <FormItem>
                            <Label>Reference</Label>
                            <Input {...field} placeholder="REF-001" />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="zone"
                        render={({ field }) => (
                          <FormItem>
                            <Label>Zone</Label>
                            <Input {...field} placeholder="Zone A" />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="brokerLicense"
                        render={({ field }) => (
                          <FormItem>
                            <Label>Broker license</Label>
                            <Input {...field} placeholder="BRN-123" />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="agentLicense"
                        render={({ field }) => (
                          <FormItem>
                            <Label>Agent license</Label>
                            <Input {...field} placeholder="ALN-456" />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="permitNumber"
                        render={({ field }) => (
                          <FormItem>
                            <Label>Permit number</Label>
                            <Input {...field} placeholder="PM-789" />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="availableFrom"
                        render={({ field }) => (
                          <FormItem>
                            <Label>Available from</Label>
                            <Input {...field} type="date" />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="averagePriceArea"
                        render={({ field }) => (
                          <FormItem>
                            <Label>Avg price / m²</Label>
                            <Input
                              type="number"
                              min={0}
                              placeholder="4200"
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                              }
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="averageSizeArea"
                        render={({ field }) => (
                          <FormItem>
                            <Label>Avg size / m²</Label>
                            <Input
                              type="number"
                              min={0}
                              placeholder="85"
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                              }
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDialogChange(false)}
                >
                  Cancel
                </Button>

                <div className="flex items-center gap-2">
                  {step > 0 && (
                    <Button type="button" variant="outline" onClick={handleBack}>
                      Back
                    </Button>
                  )}
                  {isLastStep ? (
                    <Button
                      type="submit"
                      className="bg-gradient-primary"
                      disabled={isPending}
                    >
                      Create Property
                    </Button>
                  ) : (
                    <Button type="button" onClick={handleNext}>
                      Next
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

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

export default AddProperty;
