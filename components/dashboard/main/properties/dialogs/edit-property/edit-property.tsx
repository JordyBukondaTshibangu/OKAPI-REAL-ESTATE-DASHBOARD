"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Moon, UploadCloud, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { MAX_DESCRIPTION_LENGTH } from "@/constants";
import { api } from "@/lib/api";
import { useUpdateProperty } from "@/lib/queries/properties";
import { cn } from "@/lib/utils";
import { Property, PropertyDetail } from "@/types";
import { editPropertySchema, EditPropertyFormValues } from "./schema";

const MAX_GALLERY_IMAGES = 30;
type GalleryItem = { file: File; previewUrl: string };

// Strip the R2 public base URL so we send bare object keys to the backend.
const R2_BASE = "https://pub-d5cad4963b964b9ba2720a29b5780d2b.r2.dev/";
function urlToKey(url: string): string {
  let result = url;
  while (result.startsWith(R2_BASE)) result = result.slice(R2_BASE.length);
  return result;
}

// Normalise whatever gallery comes back from the API into an array of strings.
function toGalleryArray(val: unknown): string[] {
  if (Array.isArray(val)) return (val as string[]).filter(Boolean);
  if (typeof val === "string") return val.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

const LISTING_TYPES = ["rent", "sale", "commercial"] as const;
const CATEGORIES = [
  "apartment", "villa", "townhouse", "studio", "duplex",
  "penthouse", "land", "office", "warehouse", "retail",
] as const;
const ICON_TYPES = ["building", "home", "land", "office", "store", "warehouse"] as const;
const PERIODS = ["monthly", "yearly"] as const;
const TRANSACTIONS = ["rent", "sale"] as const;

const IMAGE_GRADIENT_OPTIONS = [
  { label: "Blue Sky", value: "from-blue-400 to-blue-700" },
  { label: "Navy", value: "from-slate-700 to-slate-900" },
  { label: "Amber", value: "from-amber-400 to-orange-600" },
  { label: "Purple", value: "from-purple-400 to-purple-700" },
  { label: "Emerald", value: "from-emerald-400 to-emerald-700" },
  { label: "Rose", value: "from-rose-400 to-rose-700" },
  { label: "Indigo", value: "from-indigo-400 to-indigo-700" },
  { label: "Teal", value: "from-teal-400 to-teal-600" },
  { label: "Crimson", value: "from-red-400 to-red-700" },
  { label: "Charcoal", value: "from-gray-500 to-gray-800" },
] as const;

function joinArr(val: unknown): string {
  if (Array.isArray(val)) return (val as string[]).join(", ");
  if (typeof val === "string") return val;
  return "";
}

type EditPropertyProps = {
  property: Property;
  open: boolean;
  setOpen: (v: boolean) => void;
};

function EditProperty({ property, open, setOpen }: EditPropertyProps) {
  const { mutateAsync: updateProperty, isPending } = useUpdateProperty();
  const detail = property as PropertyDetail;

  // Existing gallery URLs loaded from the property (full R2 URLs from the API).
  const [existingGallery, setExistingGallery] = useState<string[]>(() =>
    toGalleryArray(property.gallery)
  );
  // Newly staged (not yet uploaded) local files.
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalImages = existingGallery.length + galleryItems.length;

  function handleAddFiles(files: File[]) {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    const remaining = MAX_GALLERY_IMAGES - totalImages;
    if (remaining <= 0) return;
    const newItems: GalleryItem[] = imageFiles.slice(0, remaining).map((f) => ({
      file: f,
      previewUrl: URL.createObjectURL(f),
    }));
    setGalleryItems((prev) => [...prev, ...newItems]);
  }

  function handleRemoveExisting(idx: number) {
    setExistingGallery((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleRemoveGalleryItem(idx: number) {
    setGalleryItems((prev) => {
      URL.revokeObjectURL(prev[idx].previewUrl);
      return prev.filter((_, i) => i !== idx);
    });
  }

  const form = useForm<EditPropertyFormValues>({
    resolver: zodResolver(editPropertySchema),
    defaultValues: {
      agencyId: typeof detail.agency === "object" && detail.agency !== null
        ? (detail.agency as { id?: string }).id ?? ""
        : (detail.agency as string | undefined) ?? "",
      agentId: typeof property.agent === "object" && property.agent !== null
        ? (property.agent as { id?: string }).id ?? ""
        : (property.agent as unknown as string) ?? "",
      listingType: property.listingType ?? "sale",
      category: property.category ?? "apartment",
      iconType: property.iconType ?? "home",
      title: property.title ?? "",
      subtitle: property.subtitle ?? "",
      price: property.price ?? 0,
      currency: property.currency ?? "USD",
      period: property.period ?? "",
      city: property.city ?? "",
      suburb: property.suburb ?? "",
      neighborhood: property.neighborhood ?? "",
      bedrooms: property.bedrooms ?? 0,
      bathrooms: property.bathrooms ?? 0,
      areaSqm: property.areaSqm ?? 0,
      imageGradient: property.imageGradient ?? "",
      gallery: joinArr(property.gallery),
      amenities: joinArr(detail.amenities),
      transaction: property.transaction ?? "",
      verified: property.verified ?? false,
      premium: property.premium ?? false,
      isNew: property.isNew ?? false,
      description: detail.description ?? "",
      reference: detail.reference ?? "",
      zone: detail.zone ?? "",
      brokerLicense: detail.brokerLicense ?? "",
      agentLicense: detail.agentLicense ?? "",
      permitNumber: detail.permitNumber ?? "",
      availableFrom: detail.availableFrom ?? "",
      averagePriceArea: detail.averagePriceArea ?? undefined,
      averageSizeArea: detail.averageSizeArea ?? undefined,
      isShortTerm: property.isShortTerm ?? false,
      isLongTerm: property.isLongTerm ?? true,
      pricePerNight: property.pricePerNight ?? undefined,
      minStayNights: property.minStayNights ?? undefined,
      maxStayNights: property.maxStayNights ?? undefined,
      shortTermNotes: property.shortTermNotes ?? "",
      landmark: (property as any).landmark ?? "",
      isFurnished: (property as any).isFurnished ?? false,
    },
    mode: "onChange",
  });

  const { handleSubmit, control, formState } = form;

  const onSubmit = useCallback(
    async (values: EditPropertyFormValues) => {
      function splitTrim(val: string) {
        return val.split(",").map((s) => s.trim()).filter(Boolean);
      }
      if (isSubmitting) return;
      setIsSubmitting(true);
      try {
        // Start with the remaining existing images as bare R2 keys.
        const existingKeys = existingGallery.map(urlToKey);

        // Upload any newly staged files and collect their keys.
        let newKeys: string[] = [];
        if (galleryItems.length > 0) {
          const { data: presigned } = await api.post<{ key: string; url: string }[]>(
            "/api/uploads/presign",
            { files: galleryItems.map(({ file }) => ({ filename: file.name, contentType: file.type })) },
          );
          await Promise.all(
            presigned.map(({ url }, i) =>
              fetch(url, { method: "PUT", body: galleryItems[i].file, headers: { "Content-Type": galleryItems[i].file.type } }),
            ),
          );
          newKeys = presigned.map((p) => p.key);
        }

        const galleryUrls = [...existingKeys, ...newKeys];

        await updateProperty({
          id: property.id,
          ...values,
          period: (values.period as "monthly" | "yearly" | undefined) || undefined,
          transaction: (values.transaction as "rent" | "sale" | undefined) || undefined,
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
          landmark: (values as any).landmark || undefined,
          isFurnished: (values as any).isFurnished ?? false,
        });
        toast.success("Property updated successfully");
        setOpen(false);
      } catch {
        toast.error("Failed to update property. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [existingGallery, galleryItems, isSubmitting, updateProperty, property.id, setOpen],
  );

  function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
      <div className="flex items-center gap-3 pt-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{children}</span>
        <Separator className="flex-1" />
      </div>
    );
  }

  return (
    <>
      {isPending && <Loading label="Saving changes" />}

      <Dialog open={open} onOpenChange={setOpen}>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent className="sm:max-w-[640px] min-w-[900px] flex flex-col gap-4 max-h-[90vh]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  Edit Property
                  <span className="text-sm font-normal text-muted-foreground truncate max-w-[240px]">— {property.title}</span>
                </DialogTitle>
                <DialogDescription>Update the property&apos;s information below.</DialogDescription>
              </DialogHeader>

              <ScrollArea className="flex-1 overflow-y-auto pr-2">
                <div className="flex flex-col gap-4 pb-2">

                  {/* Listing Details */}
                  <SectionTitle>Listing Details</SectionTitle>
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
                    {[
                      { name: "listingType" as const, label: "Listing type", options: LISTING_TYPES },
                      { name: "category" as const, label: "Category", options: CATEGORIES },
                      { name: "iconType" as const, label: "Icon", options: ICON_TYPES },
                    ].map(({ name, label, options }) => (
                      <FormField
                        key={name}
                        control={control}
                        name={name}
                        render={({ field }) => (
                          <FormItem>
                            <Label>{label} <span className="text-destructive">*</span></Label>
                            <Select onValueChange={field.onChange} value={field.value as string}>
                              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {(options as readonly string[]).map((o) => (
                                  <SelectItem key={o} value={o} className="capitalize">{o}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <FormField
                      control={control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Price <span className="text-destructive">*</span></Label>
                          <Input {...field} type="number" min={0} placeholder="500000"
                            value={field.value === 0 ? "" : field.value}
                            onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))} />
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
                            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
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

                  {/* Location */}
                  <SectionTitle>Location & Specs</SectionTitle>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { name: "city" as const, placeholder: "Dubai" },
                      { name: "suburb" as const, placeholder: "Marina" },
                      { name: "neighborhood" as const, placeholder: "Palm Jumeirah" },
                    ].map(({ name, placeholder }) => (
                      <FormField
                        key={name}
                        control={control}
                        name={name}
                        render={({ field }) => (
                          <FormItem>
                            <Label className="capitalize">{name} <span className="text-destructive">*</span></Label>
                            <Input {...field} placeholder={placeholder} />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { name: "bedrooms" as const, label: "Bedrooms", placeholder: "3" },
                      { name: "bathrooms" as const, label: "Bathrooms", placeholder: "2" },
                      { name: "areaSqm" as const, label: "Area (m²)", placeholder: "120" },
                    ].map(({ name, label, placeholder }) => (
                      <FormField
                        key={name}
                        control={control}
                        name={name}
                        render={({ field }) => (
                          <FormItem>
                            <Label>{label} <span className="text-destructive">*</span></Label>
                            <Input {...field} type="number" min={0} placeholder={placeholder}
                              value={field.value === 0 ? "" : field.value}
                              onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))} />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>

                  <FormField
                    control={control}
                    name={"landmark" as any}
                    render={({ field }) => (
                      <FormItem>
                        <Label>Landmark / Point de repère</Label>
                        <Input {...field} value={field.value ?? ""} placeholder="Near central market, Saint-Pierre school…" />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name={"isFurnished" as any}
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <Checkbox id="edit-isFurnished" checked={!!field.value} onCheckedChange={field.onChange} />
                        <Label htmlFor="edit-isFurnished" className="text-sm font-normal cursor-pointer">Furnished / Meublé</Label>
                      </FormItem>
                    )}
                  />

                  {/* Media */}
                  <SectionTitle>Media & Features</SectionTitle>
                  <FormField
                    control={control}
                    name="imageGradient"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Image gradient <span className="text-destructive">*</span></Label>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="w-full">
                            <div className="flex items-center gap-2 min-w-0">
                              {field.value && (
                                <span className={cn("inline-block shrink-0 w-12 h-4 rounded-sm bg-linear-to-r", field.value)} />
                              )}
                              <SelectValue placeholder="Select a gradient" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {IMAGE_GRADIENT_OPTIONS.map((opt) => (
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
                  <FormItem>
                    <Label>
                      Gallery
                      <span className="ml-1.5 text-xs text-muted-foreground font-normal">
                        ({totalImages}/{MAX_GALLERY_IMAGES})
                      </span>
                    </Label>

                    {/* ── Existing images ── */}
                    {existingGallery.length > 0 && (
                      <div className="grid grid-cols-5 gap-1.5">
                        {existingGallery.map((url, idx) => (
                          <div key={url} className="relative group aspect-square">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={url}
                              alt={`Image ${idx + 1}`}
                              className="w-full h-full object-cover rounded-md border"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveExisting(idx)}
                              className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                            {/* "existing" badge */}
                            <span className="absolute bottom-0.5 left-0.5 text-[9px] bg-black/50 text-white px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              saved
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ── Newly staged (not yet uploaded) ── */}
                    {galleryItems.length > 0 && (
                      <div className="grid grid-cols-5 gap-1.5">
                        {galleryItems.map((item, idx) => (
                          <div key={idx} className="relative group aspect-square">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.previewUrl}
                              alt={item.file.name}
                              className="w-full h-full object-cover rounded-md border border-dashed border-brand-blue"
                            />
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleRemoveGalleryItem(idx); }}
                              className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                            <span className="absolute bottom-0.5 left-0.5 text-[9px] bg-brand-blue/80 text-white px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              new
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ── Upload drop zone ── */}
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        handleAddFiles(Array.from(e.dataTransfer.files));
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "border-2 border-dashed rounded-lg py-4 px-4 cursor-pointer text-center transition-colors select-none",
                        isDragging ? "border-brand-blue bg-brand-blue/5" : "border-border hover:border-brand-navy/50",
                        totalImages >= MAX_GALLERY_IMAGES && "pointer-events-none opacity-60",
                      )}
                    >
                      <UploadCloud className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Drop images or{" "}
                        <span className="text-brand-navy font-medium underline">browse</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG, WebP</p>
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
                  </FormItem>
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
                            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
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
                      {([
                        { name: "verified" as const, label: "Verified" },
                        { name: "premium" as const, label: "Premium" },
                        { name: "isNew" as const, label: "New" },
                      ]).map(({ name, label }) => (
                        <FormField
                          key={name}
                          control={control}
                          name={name}
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-2 space-y-0">
                              <Checkbox id={name} checked={field.value as boolean} onCheckedChange={field.onChange} />
                              <Label htmlFor={name} className="text-sm font-normal cursor-pointer">{label}</Label>
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
                            placeholder="Describe the property"
                          />
                          <div className="flex justify-end">
                            <span className={cn("text-xs text-muted-foreground", { "text-destructive": exceeded })}>
                              {len}/{MAX_DESCRIPTION_LENGTH}
                            </span>
                          </div>
                        </FormItem>
                      );
                    }}
                  />

                  {/* Legal */}
                  <SectionTitle>Legal & Market</SectionTitle>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { name: "reference" as const, label: "Reference", placeholder: "REF-001" },
                      { name: "zone" as const, label: "Zone", placeholder: "Zone A" },
                      { name: "brokerLicense" as const, label: "Broker license", placeholder: "BRN-123" },
                      { name: "agentLicense" as const, label: "Agent license", placeholder: "ALN-456" },
                      { name: "permitNumber" as const, label: "Permit number", placeholder: "PM-789" },
                    ].map(({ name, label, placeholder }) => (
                      <FormField
                        key={name}
                        control={control}
                        name={name}
                        render={({ field }) => (
                          <FormItem>
                            <Label>{label}</Label>
                            <Input {...field} placeholder={placeholder} />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
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
                            type="number" min={0} placeholder="4200"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
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
                            type="number" min={0} placeholder="85"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Short-term rental */}
                  <SectionTitle>
                    <span className="flex items-center gap-1.5"><Moon className="w-3.5 h-3.5" /> Location courte durée</span>
                  </SectionTitle>
                  <div className="flex items-center gap-6">
                    {([
                      { name: "isLongTerm" as const,  label: "Long terme"   },
                      { name: "isShortTerm" as const, label: "Courte durée" },
                    ]).map(({ name, label }) => (
                      <FormField
                        key={name}
                        control={control}
                        name={name}
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2 space-y-0">
                            <Checkbox id={`edit-${name}`} checked={!!field.value} onCheckedChange={field.onChange} />
                            <Label htmlFor={`edit-${name}`} className="text-sm font-normal cursor-pointer">{label}</Label>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <FormField
                      control={control}
                      name="pricePerNight"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Prix / nuit ($)</Label>
                          <Input
                            type="number" min={0} placeholder="150"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
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
                            type="number" min={1} placeholder="2"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
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
                            type="number" min={1} placeholder="30"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
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
                      <FormItem>
                        <Label>Notes courte durée</Label>
                        <Input {...field} value={field.value ?? ""} placeholder="Ex: Idéal pour expats, minimum 3 nuits..." />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </ScrollArea>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-primary"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isPending || isSubmitting}
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </form>
        </Form>
      </Dialog>
    </>
  );
}

export default EditProperty;
