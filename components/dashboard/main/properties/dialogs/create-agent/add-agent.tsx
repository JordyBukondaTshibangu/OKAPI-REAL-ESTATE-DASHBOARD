"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ImageIcon, Link2, UploadCloud, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { useCreateProperty } from "@/lib/queries/properties";
import { Agency } from "@/types";
import { Agent } from "@/types";
import { cn } from "@/lib/utils";
import { AddPropertyFormValues, addPropertySchema } from "./schema";

// ─── Infinite-scroll hooks ────────────────────────────────────────────────────

const DROPDOWN_PAGE_SIZE = 30;

function useInfiniteAgencies() {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Agency[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [cachedSearch, setCachedSearch] = useState("");

  // Derived-state reset: when search changes, reset pagination immediately
  if (cachedSearch !== search) {
    setCachedSearch(search);
    setPage(1);
    setItems([]);
  }

  const { data, isLoading } = useAgencies({
    page,
    pageSize: DROPDOWN_PAGE_SIZE,
    search: search || undefined,
  });

  useEffect(() => {
    if (!data?.data) return;
    setItems((prev) => (page === 1 ? data.data : [...prev, ...data.data]));
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

  // Derived-state reset: when agency changes, reset pagination immediately
  if (cachedAgencyId !== agencyId) {
    setCachedAgencyId(agencyId);
    setPage(1);
    setItems([]);
  }

  const { data, isLoading } = useAgents({
    page,
    pageSize: DROPDOWN_PAGE_SIZE,
    agencyId: agencyId || undefined,
  });

  useEffect(() => {
    if (!data?.data) return;
    setItems((prev) => (page === 1 ? data.data : [...prev, ...data.data]));
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

// ─── Constants ────────────────────────────────────────────────────────────────

const LISTING_TYPES = ["rent", "sale", "commercial"] as const;

const IMAGE_GRADIENT_OPTIONS = [
  { label: "Blue Sky",     value: "from-blue-400 to-blue-700"    },
  { label: "Navy Night",   value: "from-slate-700 to-slate-900"  },
  { label: "Gold Sunrise", value: "from-amber-400 to-orange-600" },
  { label: "Purple Dusk",  value: "from-purple-400 to-purple-700"},
  { label: "Emerald",      value: "from-emerald-400 to-emerald-700"},
  { label: "Rose",         value: "from-rose-400 to-rose-700"    },
  { label: "Indigo",       value: "from-indigo-400 to-indigo-700"},
  { label: "Teal",         value: "from-teal-400 to-teal-600"    },
  { label: "Crimson",      value: "from-red-400 to-red-700"      },
  { label: "Charcoal",     value: "from-gray-500 to-gray-800"    },
] as const;

const CATEGORIES = [
  "apartment", "villa", "townhouse", "studio", "duplex",
  "penthouse", "land", "office", "warehouse", "retail",
] as const;

const ICON_TYPES = ["building", "home", "land", "office", "store", "warehouse"] as const;
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
  apartment:  ["Ascenseur", "Parking", "Balcon", "Gardien", "Salle de sport", "Piscine", "Cave", "Digicode", "Interphone"],
  villa:      ["Piscine", "Garage", "Salle de sport", "Jardin", "Terrasse", "Sécurité 24h/24", "Chauffage central", "Dressing"],
  townhouse:  ["Garage", "Jardin", "Terrasse", "Piscine", "Parking", "Cave", "Chauffage central", "Barbecue"],
  studio:     ["Cuisine équipée", "Climatisation", "Parking", "Ascenseur", "Tout inclus", "Internet inclus"],
  duplex:     ["Terrasse", "Parking", "Ascenseur", "Cave", "Vue panoramique", "Jardin privatif", "Dressing"],
  penthouse:  ["Terrasse panoramique", "Piscine privée", "Ascenseur privatif", "Parking sécurisé", "Conciergerie", "Vue mer"],
  land:       ["Eau", "Électricité", "Accès routier", "Clôturé", "Constructible", "Viabilisé", "Titre foncier"],
  office:     ["Parking couvert", "Cuisine", "Salle de réunion", "Climatisation", "Fibre optique", "Accès sécurisé", "Open space", "Cafétéria"],
  warehouse:  ["Quai de chargement", "Parking poids lourds", "Sécurité", "Électricité triphasée", "Pont roulant", "Sprinklers", "Bureau intégré"],
  retail:     ["Parking", "Vitrine", "Climatisation", "Réserve", "Cave", "Accès PMR", "Alarme"],
};

const STEPS = [
  { label: "Affectation",    description: "Agence & agent"          },
  { label: "Annonce",        description: "Type, catégorie & prix"  },
  { label: "Localisation",   description: "Adresse & caractéristiques" },
  { label: "Médias",         description: "Visuels & équipements"   },
  { label: "Légal & Marché", description: "Détails optionnels"      },
];

const STEP_REQUIRED_FIELDS: Array<(keyof AddPropertyFormValues)[]> = [
  ["agencyId", "agentId"],
  ["listingType", "category", "iconType", "title", "subtitle", "price", "currency"],
  ["city", "suburb", "neighborhood", "bedrooms", "bathrooms", "areaSqm"],
  ["imageGradient", "amenities"],
  [],
];

const MAX_GALLERY_IMAGES = 30;

type GalleryItem = { file: File; previewUrl: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Lecture du fichier échouée"));
    reader.readAsDataURL(file);
  });
}

function splitTrim(val: string): string[] {
  return val.split(",").map((s) => s.trim()).filter(Boolean);
}

function isAmenitySelected(current: string, tag: string): boolean {
  return splitTrim(current).some((a) => a.toLowerCase() === tag.toLowerCase());
}

function toggleAmenityTag(current: string, tag: string): string {
  const list = splitTrim(current);
  const idx = list.findIndex((a) => a.toLowerCase() === tag.toLowerCase());
  if (idx >= 0) {
    list.splice(idx, 1);
  } else {
    list.push(tag);
  }
  return list.join(", ");
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

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

// ─── Props ────────────────────────────────────────────────────────────────────

type AddPropertyProps = {
  open: boolean;
  resetCurrentPage?: () => void;
  setToggle: (open: boolean) => void;
};

// ─── Main Component ───────────────────────────────────────────────────────────

function AddProperty({ open, setToggle, resetCurrentPage }: AddPropertyProps) {
  const { mutateAsync: createProperty, isPending } = useCreateProperty();

  const [step, setStep] = useState(0);
  const [openDiscard, setOpenDiscard] = useState(false);
  const [agencyIdForAgents, setAgencyIdForAgents] = useState("");
  const [galleryMode, setGalleryMode] = useState<"urls" | "images">("urls");
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const agencies = useInfiniteAgencies();
  const agentsDropdown = useInfiniteAgents(agencyIdForAgents);

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

  const { reset, control, watch, formState } = form;

  const watchedCategory = watch("category");

  // ── Gallery helpers ─────────────────────────────────────────────────────────

  function handleAddFiles(files: File[]) {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    const remaining = MAX_GALLERY_IMAGES - galleryItems.length;
    if (remaining <= 0) return;
    const toAdd = imageFiles.slice(0, remaining);
    const newItems: GalleryItem[] = toAdd.map((f) => ({
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

  function handleGalleryModeChange(mode: "urls" | "images") {
    if (mode === "urls") {
      galleryItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      setGalleryItems([]);
    }
    setGalleryMode(mode);
  }

  function clearGalleryImages() {
    galleryItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setGalleryItems([]);
    setGalleryMode("urls");
  }

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
    setAgencyIdForAgents("");
    clearGalleryImages();
    setToggle(false);
    setOpenDiscard(false);
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  const onSubmit = useCallback(
    async (values: AddPropertyFormValues) => {
      // Guard: only submit from the last step to prevent button-swap timing bug
      if (step !== STEPS.length - 1) return;
      try {
        let galleryUrls: string[];
        if (galleryMode === "images") {
          galleryUrls = await Promise.all(galleryItems.map(({ file }) => readFileAsDataUrl(file)));
        } else {
          galleryUrls = values.gallery ? splitTrim(values.gallery) : [];
        }

        const payload = {
          ...values,
          period:        values.period        || undefined,
          transaction:   values.transaction   || undefined,
          gallery:       galleryUrls,
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
        toast.success("Propriété créée avec succès");
        reset();
        setStep(0);
        setAgencyIdForAgents("");
        clearGalleryImages();
        setToggle(false);
        resetCurrentPage?.();
      } catch {
        toast.error("Échec de la création. Veuillez réessayer.");
      }
    },
    [step, galleryMode, galleryItems, createProperty, reset, setToggle, resetCurrentPage],
  );

  const isLastStep = step === STEPS.length - 1;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {isPending && <Loading label="Création en cours…" />}

      <Dialog open={open} onOpenChange={handleDialogChange}>
        <DialogContent className="sm:max-w-[580px] p-0 gap-0 overflow-hidden">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
              {/* Header */}
              <div className="px-6 pt-6 pb-4 flex flex-col gap-1 border-b">
                <DialogHeader>
                  <DialogTitle>Ajouter une propriété</DialogTitle>
                  <DialogDescription>
                    {STEPS[step].description} — étape {step + 1} sur {STEPS.length}
                  </DialogDescription>
                </DialogHeader>
              </div>

              {/* Step indicator */}
              <div className="px-6 pt-5 pb-3">
                <StepIndicator current={step} />
              </div>

              {/* Step content */}
              <div className="px-6 pb-4 min-h-[280px] flex flex-col gap-4">

                {/* ── Étape 1 : Affectation ────────────────────────────── */}
                {step === 0 && (
                  <>
                    <FormField
                      control={control}
                      name="agencyId"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Agence <span className="text-destructive">*</span></Label>
                          <InfiniteCombobox
                            value={field.value}
                            onChange={(value) => {
                              field.onChange(value);
                              setAgencyIdForAgents(value);
                              form.setValue("agentId", "");
                            }}
                            placeholder="Sélectionner une agence"
                            searchPlaceholder="Rechercher une agence…"
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
                          <Label>Agent <span className="text-destructive">*</span></Label>
                          <InfiniteCombobox
                            value={field.value}
                            onChange={field.onChange}
                            placeholder={
                              agencyIdForAgents
                                ? "Sélectionner un agent"
                                : "Sélectionnez d'abord une agence"
                            }
                            searchPlaceholder="Rechercher un agent…"
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

                {/* ── Étape 2 : Détails de l'annonce ──────────────────── */}
                {step === 1 && (
                  <>
                    <FormField
                      control={control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Titre <span className="text-destructive">*</span></Label>
                          <Input {...field} placeholder="Appartement luxueux 3 chambres" />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="subtitle"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Sous-titre <span className="text-destructive">*</span></Label>
                          <Input {...field} placeholder="Vue mer au centre-ville" />
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
                            <Label>Type d'annonce <span className="text-destructive">*</span></Label>
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
                            <Label>Catégorie <span className="text-destructive">*</span></Label>
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
                            <Label>Icône <span className="text-destructive">*</span></Label>
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
                            <Label>Prix <span className="text-destructive">*</span></Label>
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
                            <Label>Devise <span className="text-destructive">*</span></Label>
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
                            <Label>Période</Label>
                            <Select
                              onValueChange={(val) => field.onChange(val === "__none__" ? "" : val)}
                              value={field.value || "__none__"}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">Aucune</SelectItem>
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

                {/* ── Étape 3 : Localisation & Caractéristiques ────────── */}
                {step === 2 && (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <FormField
                        control={control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <Label>Ville <span className="text-destructive">*</span></Label>
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
                            <Label>Commune <span className="text-destructive">*</span></Label>
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
                            <Label>Quartier <span className="text-destructive">*</span></Label>
                            <Input {...field} placeholder="Lingwala" />
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
                            <Label>
                              {watchedCategory === "office" ? "Pièces" : "Chambres"}{" "}
                              <span className="text-destructive">*</span>
                            </Label>
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
                            <Label>Salles de bain <span className="text-destructive">*</span></Label>
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
                            <Label>Surface (m²) <span className="text-destructive">*</span></Label>
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

                {/* ── Étape 4 : Médias & Équipements ──────────────────── */}
                {step === 3 && (
                  <>
                    <FormField
                      control={control}
                      name="imageGradient"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Dégradé d'image <span className="text-destructive">*</span></Label>
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
                                <SelectValue placeholder="Choisir un dégradé" />
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
                    <FormField
                      control={control}
                      name="gallery"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <Label>Galerie photos</Label>
                            <div className="flex items-center gap-0.5 rounded-md border p-0.5 bg-muted">
                              <button
                                type="button"
                                onClick={() => handleGalleryModeChange("urls")}
                                className={cn(
                                  "flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors",
                                  galleryMode === "urls"
                                    ? "bg-background shadow-sm text-foreground"
                                    : "text-muted-foreground hover:text-foreground",
                                )}
                              >
                                <Link2 className="w-3 h-3" />
                                URLs
                              </button>
                              <button
                                type="button"
                                onClick={() => handleGalleryModeChange("images")}
                                className={cn(
                                  "flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors",
                                  galleryMode === "images"
                                    ? "bg-background shadow-sm text-foreground"
                                    : "text-muted-foreground hover:text-foreground",
                                )}
                              >
                                <ImageIcon className="w-3 h-3" />
                                Images
                              </button>
                            </div>
                          </div>

                          {galleryMode === "urls" ? (
                            <>
                              <Input {...field} placeholder="https://img1.jpg, https://img2.jpg" />
                              <p className="text-xs text-muted-foreground">Séparer par des virgules</p>
                            </>
                          ) : (
                            <>
                              <div
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={(e) => {
                                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                    setIsDragging(false);
                                  }
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
                                  galleryItems.length >= MAX_GALLERY_IMAGES && "pointer-events-none opacity-60",
                                )}
                              >
                                <UploadCloud className="w-7 h-7 mx-auto mb-1.5 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                  Glisser-déposer ou{" "}
                                  <span className="text-brand-navy font-medium underline">parcourir</span>
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {galleryItems.length}/{MAX_GALLERY_IMAGES} images • JPG, PNG, WebP
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
                                <div className="grid grid-cols-5 gap-1.5 mt-1">
                                  {galleryItems.map((item, idx) => (
                                    <div key={idx} className="relative group aspect-square">
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
                            </>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="amenities"
                      render={({ field }) => {
                        const suggestions = AMENITY_SUGGESTIONS[watchedCategory] ?? [];
                        return (
                          <FormItem>
                            <Label>Équipements <span className="text-destructive">*</span></Label>
                            {suggestions.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pb-1">
                                {suggestions.map((tag) => {
                                  const selected = isAmenitySelected(field.value, tag);
                                  return (
                                    <button
                                      key={tag}
                                      type="button"
                                      onClick={() =>
                                        field.onChange(toggleAmenityTag(field.value, tag))
                                      }
                                      className={cn(
                                        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors",
                                        selected
                                          ? "bg-brand-navy text-white border-brand-navy"
                                          : "bg-background text-muted-foreground border-border hover:border-brand-navy hover:text-foreground",
                                      )}
                                    >
                                      {selected && <X className="w-2.5 h-2.5" />}
                                      {tag}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                            <Input {...field} placeholder="Piscine, Garage, Ascenseur…" />
                            <p className="text-xs text-muted-foreground">Cliquez sur les tags ou saisissez manuellement, séparés par des virgules</p>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
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
                                <SelectItem value="__none__">Aucune</SelectItem>
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
                            { name: "verified", label: "Vérifié"  },
                            { name: "premium",  label: "Premium"  },
                            { name: "isNew",    label: "Nouveau"  },
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
                              placeholder="Décrivez la propriété (optionnel)"
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

                {/* ── Étape 5 : Légal & Marché ────────────────────────── */}
                {step === 4 && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={control}
                        name="reference"
                        render={({ field }) => (
                          <FormItem>
                            <Label>Référence</Label>
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
                            <Select
                              onValueChange={(val) => field.onChange(val === "__none__" ? "" : val)}
                              value={field.value || "__none__"}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Choisir une zone" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">Non spécifiée</SelectItem>
                                {ZONE_OPTIONS.map((z) => (
                                  <SelectItem key={z} value={z}>{z}</SelectItem>
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
                            <Label>Licence courtier</Label>
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
                            <Label>Licence agent</Label>
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
                            <Label>N° de permis</Label>
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
                            <Label>Disponible à partir du</Label>
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
                            <Label>Prix moy. / m²</Label>
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
                            <Label>Surface moy. / m²</Label>
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
                  Annuler
                </Button>

                <div className="flex items-center gap-2">
                  {step > 0 && (
                    <Button type="button" variant="outline" onClick={handleBack}>
                      Retour
                    </Button>
                  )}
                  {isLastStep ? (
                    <Button
                      type="button"
                      className="bg-gradient-primary"
                      disabled={isPending}
                      onClick={() => form.handleSubmit(onSubmit)()}
                    >
                      Créer la propriété
                    </Button>
                  ) : (
                    <Button type="button" onClick={handleNext}>
                      Suivant
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
        title="Annuler les modifications ?"
        onDiscard={handleDiscard}
        onOpenChange={setOpenDiscard}
        onClose={() => setOpenDiscard(false)}
        description="Vous avez saisi des informations qui n'ont pas été enregistrées. Fermer maintenant les supprimera."
      />
    </>
  );
}

export default AddProperty;
