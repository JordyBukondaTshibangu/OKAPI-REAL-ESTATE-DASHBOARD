"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Moon, UploadCloud, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
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
import { api } from "@/lib/api";
import { useCreateProperty } from "@/lib/queries/properties";
import { Agency } from "@/types";
import { Agent } from "@/types";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import { AddPropertyFormValues, addPropertySchema } from "./schema";

// ─── Infinite-scroll hooks ────────────────────────────────────────────────────

const DROPDOWN_PAGE_SIZE = 30;

function useInfiniteAgencies() {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Agency[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [cachedSearch, setCachedSearch] = useState("");
  const [prevData, setPrevData] = useState<Agency[] | undefined>(undefined);

  if (cachedSearch !== search) {
    setCachedSearch(search);
    setPage(1);
    setItems([]);
    setPrevData(undefined);
  }

  const { data, isLoading } = useAgencies({
    page,
    pageSize: DROPDOWN_PAGE_SIZE,
    search: search || undefined,
  });

  if (data?.data !== prevData) {
    setPrevData(data?.data);
    if (data?.data) {
      setItems((prev) => (page === 1 ? data.data : [...prev, ...data.data]));
      setIsLoadingMore(false);
    }
  }

  const totalCount = data?.totalCount ?? 0;
  const hasMore = items.length < totalCount;

  function loadMore() {
    if (hasMore && !isLoadingMore) {
      setIsLoadingMore(true);
      setPage((p) => p + 1);
    }
  }

  function onSearch(query: string) {
    setSearch(query);
  }

  return {
    items,
    isLoading: isLoading && page === 1,
    isLoadingMore,
    hasMore,
    loadMore,
    onSearch,
  };
}

function useInfiniteAgents(agencyId: string) {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Agent[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [cachedAgencyId, setCachedAgencyId] = useState(agencyId);
  const [prevData, setPrevData] = useState<Agent[] | undefined>(undefined);

  if (cachedAgencyId !== agencyId) {
    setCachedAgencyId(agencyId);
    setPage(1);
    setItems([]);
    setPrevData(undefined);
  }

  const { data, isLoading } = useAgents({
    page,
    pageSize: DROPDOWN_PAGE_SIZE,
    agencyId: agencyId || undefined,
  });

  if (data?.data !== prevData) {
    setPrevData(data?.data);
    if (data?.data) {
      setItems((prev) => (page === 1 ? data.data : [...prev, ...data.data]));
      setIsLoadingMore(false);
    }
  }

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

// ─── Constants ────────────────────────────────────────────────────────────────

const LISTING_TYPES = ["rent", "sale", "commercial"] as const;

const IMAGE_GRADIENT_OPTIONS = [
  { label: "Blue Sky", value: "from-blue-400 to-blue-700" },
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

const CATEGORIES = [
  "apartment",
  "villa",
  "townhouse",
  "studio",
  "duplex",
  "penthouse",
  "land",
  "office",
  "warehouse",
  "retail",
] as const;

const ICON_TYPES = [
  "building",
  "home",
  "land",
  "office",
  "store",
  "warehouse",
] as const;
const PERIODS = ["monthly", "yearly"] as const;
const TRANSACTIONS = ["rent", "sale"] as const;

const ZONE_OPTIONS = [
  "Résidentielle",
  "Commerciale",
  "Industrielle",
  "Mixte",
  "Agricole",
  "Touristique",
  "Zone franche",
  "Zone portuaire",
];

const AMENITY_SUGGESTIONS: Record<string, string[]> = {
  apartment: [
    "Ascenseur",
    "Parking",
    "Balcon",
    "Gardien",
    "Salle de sport",
    "Piscine",
    "Cave",
    "Digicode",
    "Interphone",
  ],
  villa: [
    "Piscine",
    "Garage",
    "Salle de sport",
    "Jardin",
    "Terrasse",
    "Sécurité 24h/24",
    "Chauffage central",
    "Dressing",
  ],
  townhouse: [
    "Garage",
    "Jardin",
    "Terrasse",
    "Piscine",
    "Parking",
    "Cave",
    "Chauffage central",
    "Barbecue",
  ],
  studio: [
    "Cuisine équipée",
    "Climatisation",
    "Parking",
    "Ascenseur",
    "Tout inclus",
    "Internet inclus",
  ],
  duplex: [
    "Terrasse",
    "Parking",
    "Ascenseur",
    "Cave",
    "Vue panoramique",
    "Jardin privatif",
    "Dressing",
  ],
  penthouse: [
    "Terrasse panoramique",
    "Piscine privée",
    "Ascenseur privatif",
    "Parking sécurisé",
    "Conciergerie",
    "Vue mer",
  ],
  land: [
    "Eau",
    "Électricité",
    "Accès routier",
    "Clôturé",
    "Constructible",
    "Viabilisé",
    "Titre foncier",
  ],
  office: [
    "Parking couvert",
    "Cuisine",
    "Salle de réunion",
    "Climatisation",
    "Fibre optique",
    "Accès sécurisé",
    "Open space",
    "Cafétéria",
  ],
  warehouse: [
    "Quai de chargement",
    "Parking poids lourds",
    "Sécurité",
    "Électricité triphasée",
    "Pont roulant",
    "Sprinklers",
    "Bureau intégré",
  ],
  retail: [
    "Parking",
    "Vitrine",
    "Climatisation",
    "Réserve",
    "Cave",
    "Accès PMR",
    "Alarme",
  ],
};

const STEP_REQUIRED_FIELDS: Array<(keyof AddPropertyFormValues)[]> = [
  ["agencyId", "agentId"],
  [
    "listingType",
    "category",
    "iconType",
    "title",
    "subtitle",
    "price",
    "currency",
  ],
  ["city", "suburb", "neighborhood", "bedrooms", "bathrooms", "areaSqm"],
  ["imageGradient", "amenities"],
  [],
];

const MAX_GALLERY_IMAGES = 30;

type GalleryItem = { file: File; previewUrl: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function splitTrim(val: string): string[] {
  return val
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function isAmenitySelected(current: string, tag: string): boolean {
  return splitTrim(current).some((a) => a.toLowerCase() === tag.toLowerCase());
}

function toggleAmenityTag(current: string, tag: string): string {
  const list = splitTrim(current);
  const idx = list.findIndex((a) => a.toLowerCase() === tag.toLowerCase());
  if (idx >= 0) list.splice(idx, 1);
  else list.push(tag);
  return list.join(", ");
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({
  current,
  steps,
}: {
  current: number;
  steps: { label: string }[];
}) {
  return (
    <div className="flex items-center justify-center select-none">
      {steps.map((s, i) => (
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
          {i < steps.length - 1 && (
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

// ─── Props ────────────────────────────────────────────────────────────────────

type AddPropertyProps = {
  open: boolean;
  resetCurrentPage?: () => void;
  setToggle: (open: boolean) => void;
};

// ─── Main Component ───────────────────────────────────────────────────────────

function AddProperty({ open, setToggle, resetCurrentPage }: AddPropertyProps) {
  const t = useTranslation();
  const fp = t.forms.property;

  const { mutateAsync: createProperty, isPending } = useCreateProperty();

  const [step, setStep] = useState(0);
  const [openDiscard, setOpenDiscard] = useState(false);
  const [agencyIdForAgents, setAgencyIdForAgents] = useState("");
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const agencies = useInfiniteAgencies();
  const agentsDropdown = useInfiniteAgents(agencyIdForAgents);

  const STEPS = fp.steps as readonly { label: string; description: string }[];

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
      isShortTerm: false,
      isLongTerm: true,
      pricePerNight: undefined,
      minStayNights: undefined,
      maxStayNights: undefined,
      shortTermNotes: "",
    },
    mode: "onChange",
  });

  const { reset, control, watch, formState } = form;
  const watchedCategory = watch("category");

  // ── Gallery helpers ──────────────────────────────────────────────────────────

  function handleAddFiles(files: File[]) {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    const remaining = MAX_GALLERY_IMAGES - galleryItems.length;
    if (remaining <= 0) return;
    const newItems: GalleryItem[] = imageFiles.slice(0, remaining).map((f) => ({
      file: f,
      previewUrl: URL.createObjectURL(f),
    }));
    setGalleryItems((prev) => [...prev, ...newItems]);
  }

  function handleRemoveGalleryItem(idx: number) {
    setGalleryItems((prev) => {
      URL.revokeObjectURL(prev[idx].previewUrl);
      return prev.filter((_, i) => i !== idx);
    });
  }

  function clearGalleryImages() {
    galleryItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setGalleryItems([]);
  }

  // ── Navigation ───────────────────────────────────────────────────────────────

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
    setAgencyIdForAgents("");
    clearGalleryImages();
    setToggle(false);
    setOpenDiscard(false);
  }

  // ── Submit ───────────────────────────────────────────────────────────────────

  const onSubmit = useCallback(
    async (values: AddPropertyFormValues) => {
      if (step !== STEPS.length - 1) return;
      if (isSubmitting) return;
      setIsSubmitting(true);
      try {
        let galleryUrls: string[];
        if (galleryItems.length > 0) {
          const { data: presigned } = await api.post<
            { key: string; url: string }[]
          >("/api/uploads/presign", {
            files: galleryItems.map(({ file }) => ({
              filename: file.name,
              contentType: file.type,
            })),
          });
          await Promise.all(
            presigned.map(({ url }, i) =>
              fetch(url, {
                method: "PUT",
                body: galleryItems[i].file,
                headers: { "Content-Type": galleryItems[i].file.type },
              }),
            ),
          );
          galleryUrls = presigned.map((p) => p.key);
        } else {
          galleryUrls = [];
        }

        const payload = {
          ...values,
          period: values.period || undefined,
          transaction: values.transaction || undefined,
          gallery: galleryUrls,
          amenities: splitTrim(values.amenities),
          description: values.description || undefined,
          reference: values.reference || undefined,
          zone: values.zone || undefined,
          brokerLicense: values.brokerLicense || undefined,
          agentLicense: values.agentLicense || undefined,
          permitNumber: values.permitNumber || undefined,
          availableFrom: values.availableFrom || undefined,
          shortTermNotes: values.shortTermNotes || undefined,
        };
        await createProperty(payload);
        toast.success(fp.toast.created);
        reset();
        setStep(0);
        setAgencyIdForAgents("");
        clearGalleryImages();
        setToggle(false);
        resetCurrentPage?.();
      } catch {
        toast.error(fp.toast.createFailed);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      step,
      STEPS.length,
      isSubmitting,
      galleryItems,
      createProperty,
      reset,
      setToggle,
      resetCurrentPage,
      fp,
    ],
  );

  const isLastStep = step === STEPS.length - 1;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      {isPending && <Loading label={fp.loading.creating} />}

      <Dialog open={open} onOpenChange={handleDialogChange}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-[580px] p-0 gap-0 max-h-[90dvh] flex flex-col overflow-hidden">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col min-h-0 flex-1 overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 pt-6 pb-4 flex flex-col gap-1 border-b">
                <DialogHeader>
                  <DialogTitle>{fp.addTitle}</DialogTitle>
                  <DialogDescription>
                    {STEPS[step].description} —{" "}
                    {fp.stepOf
                      .replace("{current}", String(step + 1))
                      .replace("{total}", String(STEPS.length))}
                  </DialogDescription>
                </DialogHeader>
              </div>

              {/* Step indicator */}
              <div className="px-6 pt-5 pb-3">
                <StepIndicator current={step} steps={[...STEPS]} />
              </div>

              {/* Step content */}
              <div className="px-6 pb-4 flex-1 overflow-y-auto flex flex-col gap-4 min-h-0">
                {/* Step 1 — Assignment */}
                {step === 0 && (
                  <>
                    <FormField
                      control={control}
                      name="agencyId"
                      render={({ field }) => (
                        <FormItem>
                          <Label>
                            {fp.labels.agency}{" "}
                            <span className="text-destructive">*</span>
                          </Label>
                          <InfiniteCombobox
                            value={field.value}
                            onChange={(value) => {
                              field.onChange(value);
                              setAgencyIdForAgents(value);
                              form.setValue("agentId", "");
                            }}
                            placeholder={fp.placeholders.selectAgency}
                            searchPlaceholder={fp.placeholders.searchAgency}
                            items={agencies.items}
                            isLoading={agencies.isLoading}
                            isLoadingMore={agencies.isLoadingMore}
                            hasMore={agencies.hasMore}
                            onLoadMore={agencies.loadMore}
                            onSearch={agencies.onSearch}
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
                          <Label>
                            {fp.labels.agent}{" "}
                            <span className="text-destructive">*</span>
                          </Label>
                          <InfiniteCombobox
                            value={field.value}
                            onChange={field.onChange}
                            placeholder={
                              agencyIdForAgents
                                ? fp.placeholders.selectAgent
                                : fp.placeholders.selectAgentFirst
                            }
                            searchPlaceholder={fp.placeholders.searchAgent}
                            items={agentsDropdown.items}
                            isLoading={agentsDropdown.isLoading}
                            isLoadingMore={agentsDropdown.isLoadingMore}
                            hasMore={agentsDropdown.hasMore}
                            onLoadMore={agentsDropdown.loadMore}
                            disabled={!agencyIdForAgents}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {/* Step 2 — Listing details */}
                {step === 1 && (
                  <>
                    <FormField
                      control={control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <Label>
                            {fp.labels.title}{" "}
                            <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            {...field}
                            placeholder={fp.placeholders.propertyTitle}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="subtitle"
                      render={({ field }) => (
                        <FormItem>
                          <Label>
                            {fp.labels.subtitle}{" "}
                            <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            {...field}
                            placeholder={fp.placeholders.propertySubtitle}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <FormField
                        control={control}
                        name="listingType"
                        render={({ field }) => (
                          <FormItem>
                            <Label>
                              {fp.labels.listingType}{" "}
                              <span className="text-destructive">*</span>
                            </Label>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {LISTING_TYPES.map((v) => (
                                  <SelectItem
                                    key={v}
                                    value={v}
                                    className="capitalize"
                                  >
                                    {v}
                                  </SelectItem>
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
                            <Label>
                              {fp.labels.category}{" "}
                              <span className="text-destructive">*</span>
                            </Label>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {CATEGORIES.map((c) => (
                                  <SelectItem
                                    key={c}
                                    value={c}
                                    className="capitalize"
                                  >
                                    {c}
                                  </SelectItem>
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
                            <Label>
                              {fp.labels.icon}{" "}
                              <span className="text-destructive">*</span>
                            </Label>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {ICON_TYPES.map((v) => (
                                  <SelectItem
                                    key={v}
                                    value={v}
                                    className="capitalize"
                                  >
                                    {v}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <FormField
                        control={control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <Label>
                              {fp.labels.price}{" "}
                              <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              {...field}
                              type="number"
                              min={0}
                              placeholder="500000"
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
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
                            <Label>
                              {fp.labels.currency}{" "}
                              <span className="text-destructive">*</span>
                            </Label>
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
                            <Label>{fp.labels.period}</Label>
                            <Select
                              onValueChange={(val) =>
                                field.onChange(val === "__none__" ? "" : val)
                              }
                              value={field.value || "__none__"}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">
                                  {fp.placeholders.none}
                                </SelectItem>
                                {PERIODS.map((p) => (
                                  <SelectItem
                                    key={p}
                                    value={p}
                                    className="capitalize"
                                  >
                                    {p}
                                  </SelectItem>
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

                {/* Step 3 — Location */}
                {step === 2 && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <FormField
                        control={control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <Label>
                              {fp.labels.city}{" "}
                              <span className="text-destructive">*</span>
                            </Label>
                            <Input {...field} placeholder="Kinshasa" />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="suburb"
                        render={({ field }) => (
                          <FormItem>
                            <Label>
                              {fp.labels.suburb}{" "}
                              <span className="text-destructive">*</span>
                            </Label>
                            <Input {...field} placeholder="Gombe" />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="neighborhood"
                        render={({ field }) => (
                          <FormItem>
                            <Label>
                              {fp.labels.neighborhood}{" "}
                              <span className="text-destructive">*</span>
                            </Label>
                            <Input {...field} placeholder="Lingwala" />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <FormField
                        control={control}
                        name="bedrooms"
                        render={({ field }) => (
                          <FormItem>
                            <Label>
                              {watchedCategory === "office"
                                ? fp.labels.bedroomsOffice
                                : fp.labels.bedrooms}{" "}
                              <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              {...field}
                              type="number"
                              min={0}
                              placeholder="3"
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
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
                            <Label>
                              {fp.labels.bathrooms}{" "}
                              <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              {...field}
                              type="number"
                              min={0}
                              placeholder="2"
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
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
                            <Label>
                              {fp.labels.areaSqm}{" "}
                              <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              {...field}
                              type="number"
                              min={0}
                              step={0.1}
                              placeholder="120"
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}

                {/* Step 4 — Media & amenities */}
                {step === 3 && (
                  <>
                    <FormField
                      control={control}
                      name="imageGradient"
                      render={({ field }) => (
                        <FormItem>
                          <Label>
                            {fp.labels.imageGradient}{" "}
                            <span className="text-destructive">*</span>
                          </Label>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
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
                                <SelectValue
                                  placeholder={fp.placeholders.selectGradient}
                                />
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              {IMAGE_GRADIENT_OPTIONS.map((opt) => (
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
                    <FormItem>
                      <Label>{fp.labels.gallery}</Label>
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={(e) => {
                          if (
                            !e.currentTarget.contains(e.relatedTarget as Node)
                          )
                            setIsDragging(false);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDragging(false);
                          handleAddFiles(Array.from(e.dataTransfer.files));
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                          "border-2 border-dashed rounded-lg py-5 px-4 cursor-pointer text-center transition-colors select-none",
                          isDragging
                            ? "border-brand-blue bg-brand-blue/5"
                            : "border-border hover:border-brand-navy/50",
                          galleryItems.length >= MAX_GALLERY_IMAGES &&
                            "pointer-events-none opacity-60",
                        )}
                      >
                        <UploadCloud className="w-7 h-7 mx-auto mb-1.5 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {fp.placeholders.dragOrBrowse}{" "}
                          <span className="text-brand-navy font-medium underline">
                            {fp.placeholders.browse}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {galleryItems.length}/{MAX_GALLERY_IMAGES} images •
                          JPG, PNG, WebP
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            handleAddFiles(Array.from(e.target.files ?? []));
                            e.target.value = "";
                          }}
                        />
                      </div>
                      {galleryItems.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 mt-1">
                          {galleryItems.map((item, idx) => (
                            <div
                              key={idx}
                              className="relative group aspect-square"
                            >
                              <img
                                src={item.previewUrl}
                                alt={item.file.name}
                                className="w-full h-full object-cover rounded-md border"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveGalleryItem(idx);
                                }}
                                className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </FormItem>
                    <FormField
                      control={control}
                      name="amenities"
                      render={({ field }) => {
                        const suggestions =
                          AMENITY_SUGGESTIONS[watchedCategory] ?? [];
                        return (
                          <FormItem>
                            <Label>
                              {fp.labels.amenities}{" "}
                              <span className="text-destructive">*</span>
                            </Label>
                            {suggestions.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pb-1">
                                {suggestions.map((tag) => {
                                  const selected = isAmenitySelected(
                                    field.value,
                                    tag,
                                  );
                                  return (
                                    <button
                                      key={tag}
                                      type="button"
                                      onClick={() =>
                                        field.onChange(
                                          toggleAmenityTag(field.value, tag),
                                        )
                                      }
                                      className={cn(
                                        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors",
                                        selected
                                          ? "bg-brand-navy text-white border-brand-navy"
                                          : "bg-background text-muted-foreground border-border hover:border-brand-navy hover:text-foreground",
                                      )}
                                    >
                                      {selected && (
                                        <X className="w-2.5 h-2.5" />
                                      )}
                                      {tag}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                            <Input
                              {...field}
                              placeholder={fp.placeholders.amenities}
                            />
                            <p className="text-xs text-muted-foreground">
                              {fp.placeholders.amenitiesHint}
                            </p>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FormField
                        control={control}
                        name="transaction"
                        render={({ field }) => (
                          <FormItem>
                            <Label>{fp.labels.transaction}</Label>
                            <Select
                              onValueChange={(val) =>
                                field.onChange(val === "__none__" ? "" : val)
                              }
                              value={field.value || "__none__"}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">
                                  {fp.placeholders.none}
                                </SelectItem>
                                {TRANSACTIONS.map((v) => (
                                  <SelectItem
                                    key={v}
                                    value={v}
                                    className="capitalize"
                                  >
                                    {v}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex flex-wrap items-end gap-3 pb-1">
                        {[
                          {
                            name: "verified" as const,
                            label: fp.labels.verified,
                          },
                          {
                            name: "premium" as const,
                            label: fp.labels.premium,
                          },
                          { name: "isNew" as const, label: fp.labels.isNew },
                        ].map(({ name, label }) => (
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
                                <Label
                                  htmlFor={name}
                                  className="text-sm font-normal cursor-pointer"
                                >
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
                            <Label>{fp.labels.description}</Label>
                            <Textarea
                              {...field}
                              value={field.value ?? ""}
                              className={cn("h-20", {
                                "border-destructive": exceeded,
                              })}
                              placeholder={fp.placeholders.describeProperty}
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
                          </FormItem>
                        );
                      }}
                    />
                  </>
                )}

                {/* Step 5 — Legal & Market */}
                {step === 4 && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FormField
                        control={control}
                        name="reference"
                        render={({ field }) => (
                          <FormItem>
                            <Label>{fp.labels.reference}</Label>
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
                            <Label>{fp.labels.zone}</Label>
                            <Select
                              onValueChange={(val) =>
                                field.onChange(val === "__none__" ? "" : val)
                              }
                              value={field.value || "__none__"}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue
                                  placeholder={fp.placeholders.selectZone}
                                />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">
                                  {fp.placeholders.notSpecified}
                                </SelectItem>
                                {ZONE_OPTIONS.map((z) => (
                                  <SelectItem key={z} value={z}>
                                    {z}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="brokerLicense"
                        render={({ field }) => (
                          <FormItem>
                            <Label>{fp.labels.brokerLicense}</Label>
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
                            <Label>{fp.labels.agentLicense}</Label>
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
                            <Label>{fp.labels.permitNumber}</Label>
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
                            <Label>{fp.labels.availableFrom}</Label>
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
                            <Label>{fp.labels.avgPriceArea}</Label>
                            <Input
                              type="number"
                              min={0}
                              placeholder="4200"
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ""
                                    ? undefined
                                    : Number(e.target.value),
                                )
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
                            <Label>{fp.labels.avgSizeArea}</Label>
                            <Input
                              type="number"
                              min={0}
                              placeholder="85"
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ""
                                    ? undefined
                                    : Number(e.target.value),
                                )
                              }
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Short-term rental */}
                    <div className="col-span-2 pt-2 border-t">
                      <div className="flex items-center gap-2 mb-3">
                        <Moon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Location courte durée
                        </span>
                      </div>
                      <div className="flex items-center gap-6 mb-3">
                        {[
                          { name: "isLongTerm" as const, label: "Long terme" },
                          {
                            name: "isShortTerm" as const,
                            label: "Courte durée",
                          },
                        ].map(({ name, label }) => (
                          <FormField
                            key={name}
                            control={control}
                            name={name}
                            render={({ field }) => (
                              <FormItem className="flex items-center gap-2 space-y-0">
                                <Checkbox
                                  id={name}
                                  checked={!!field.value}
                                  onCheckedChange={field.onChange}
                                />
                                <Label
                                  htmlFor={name}
                                  className="text-sm font-normal cursor-pointer"
                                >
                                  {label}
                                </Label>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <FormField
                          control={control}
                          name="pricePerNight"
                          render={({ field }) => (
                            <FormItem>
                              <Label>Prix / nuit ($)</Label>
                              <Input
                                type="number"
                                min={0}
                                placeholder="150"
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? undefined
                                      : Number(e.target.value),
                                  )
                                }
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name="minStayNights"
                          render={({ field }) => (
                            <FormItem>
                              <Label>Séjour min (nuits)</Label>
                              <Input
                                type="number"
                                min={1}
                                placeholder="2"
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? undefined
                                      : Number(e.target.value),
                                  )
                                }
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name="maxStayNights"
                          render={({ field }) => (
                            <FormItem>
                              <Label>Séjour max (nuits)</Label>
                              <Input
                                type="number"
                                min={1}
                                placeholder="30"
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? undefined
                                      : Number(e.target.value),
                                  )
                                }
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={control}
                        name="shortTermNotes"
                        render={({ field }) => (
                          <FormItem className="mt-3">
                            <Label>Notes courte durée</Label>
                            <Input
                              {...field}
                              value={field.value ?? ""}
                              placeholder="Ex: Idéal pour expats, minimum 3 nuits..."
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
                  {fp.buttons.cancel}
                </Button>

                <div className="flex items-center gap-2">
                  {step > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                    >
                      {fp.buttons.back}
                    </Button>
                  )}
                  {isLastStep ? (
                    <Button
                      type="button"
                      className="bg-gradient-primary"
                      disabled={isPending || isSubmitting}
                      onClick={() => form.handleSubmit(onSubmit)()}
                    >
                      {fp.buttons.create}
                    </Button>
                  ) : (
                    <Button type="button" onClick={handleNext}>
                      {fp.buttons.next}
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
        title={fp.discard.title}
        onDiscard={handleDiscard}
        onOpenChange={setOpenDiscard}
        onClose={() => setOpenDiscard(false)}
        description={fp.discard.description}
      />
    </>
  );
}

export default AddProperty;
