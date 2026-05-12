"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
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
import { useUpdateAgency } from "@/lib/queries/agencies";
import { cn } from "@/lib/utils";
import { Agency } from "@/types";
import { addAgencySchema, AddAgencyFormValues } from "../create-agency/schema";

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

const currentYear = new Date().getFullYear();

function joinArr(val: unknown): string {
  if (Array.isArray(val)) return val.join(", ");
  if (typeof val === "string") return val;
  return "";
}

type EditAgencyProps = {
  agency: Agency;
  open: boolean;
  setOpen: (v: boolean) => void;
};

function EditAgency({ agency, open, setOpen }: EditAgencyProps) {
  const { mutateAsync: updateAgency, isPending } = useUpdateAgency();

  const form = useForm<AddAgencyFormValues>({
    resolver: zodResolver(addAgencySchema),
    defaultValues: {
      name: agency.name ?? "",
      monogram: agency.monogram ?? "",
      accentClass: agency.accentClass ?? "",
      tagline: agency.tagline ?? "",
      description: agency.description ?? "",
      address: agency.address ?? "",
      phone: agency.phone ?? "",
      email: agency.email ?? "",
      website: agency.website ?? "",
      founded: agency.founded ?? currentYear,
      specializations: joinArr(agency.specializations),
      areasServed: joinArr(agency.areasServed),
      languages: joinArr(agency.languages),
      certifications: joinArr(agency.certifications),
    },
    mode: "onChange",
  });

  const { handleSubmit, control, formState } = form;

  const onSubmit = useCallback(
    async (values: AddAgencyFormValues) => {
      function splitTrim(val: string) {
        return val.split(",").map((s) => s.trim()).filter(Boolean);
      }
      try {
        await updateAgency({
          id: agency.id,
          ...values,
          website: values.website || undefined,
          specializations: splitTrim(values.specializations),
          areasServed: splitTrim(values.areasServed),
          languages: splitTrim(values.languages),
          certifications: values.certifications ? splitTrim(values.certifications) : [],
        });
        toast.success("Agency updated successfully");
        setOpen(false);
      } catch {
        toast.error("Failed to update agency. Please try again.");
      }
    },
    [updateAgency, agency.id, setOpen],
  );

  return (
    <>
      {isPending && <Loading label="Saving changes" />}

      <Dialog open={open} onOpenChange={setOpen}>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent className="sm:max-w-xl min-w-[850px] flex flex-col gap-4 max-h-[90vh]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  Edit Agency
                  <span className="text-sm font-normal text-muted-foreground">— {agency.name}</span>
                </DialogTitle>
                <DialogDescription>Update the agency&apos;s information below.</DialogDescription>
              </DialogHeader>

              <ScrollArea className="flex-1 overflow-y-auto pr-1">
                <div className="flex flex-col gap-4 pb-2">
                  {/* Identity */}
                  <div className="grid grid-cols-3 gap-3">
                    <FormField
                      control={control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <Label>Name <span className="text-destructive">*</span></Label>
                          <Input {...field} placeholder="e.g. Coldwell Banker" />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="monogram"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Monogram <span className="text-destructive">*</span></Label>
                          <Input {...field} placeholder="CB" maxLength={5} />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={control}
                      name="accentClass"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Accent color <span className="text-destructive">*</span></Label>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="w-full">
                              <div className="flex items-center gap-2 min-w-0">
                                {field.value && (
                                  <span className={cn("inline-block shrink-0 w-3 h-3 rounded-full", field.value)} />
                                )}
                                <SelectValue placeholder="Pick a color" />
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="founded"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Founded <span className="text-destructive">*</span></Label>
                          <Input {...field} type="number" min={1800} max={currentYear} placeholder="2005"
                            onChange={(e) => field.onChange(Number(e.target.value))} />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={control}
                    name="tagline"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Tagline <span className="text-destructive">*</span></Label>
                        <Input {...field} placeholder="Your trusted real estate partner" />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Contact */}
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Email <span className="text-destructive">*</span></Label>
                          <Input {...field} type="email" placeholder="contact@agency.com" />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Phone <span className="text-destructive">*</span></Label>
                          <Input {...field} placeholder="+1 234 567 8900" />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Address <span className="text-destructive">*</span></Label>
                        <Input {...field} placeholder="123 Main St, City" />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Website</Label>
                        <Input {...field} placeholder="https://agency.com" />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* About */}
                  <FormField
                    control={control}
                    name="description"
                    render={({ field }) => {
                      const len = field.value?.length ?? 0;
                      const exceeded = len > MAX_DESCRIPTION_LENGTH;
                      return (
                        <FormItem>
                          <Label>Description <span className="text-destructive">*</span></Label>
                          <Textarea
                            {...field}
                            className={cn("h-24", { "border-destructive": exceeded })}
                            placeholder="Describe the agency"
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

                  {/* Arrays */}
                  {[
                    { name: "specializations" as const, label: "Specializations", placeholder: "Residential, Commercial, Luxury", required: true },
                    { name: "areasServed" as const, label: "Areas served", placeholder: "Downtown, Suburbs, Coastal", required: true },
                    { name: "languages" as const, label: "Languages", placeholder: "English, French, Arabic", required: true },
                    { name: "certifications" as const, label: "Certifications", placeholder: "ISO 9001, RICS, NAR", required: false },
                  ].map(({ name, label, placeholder, required }) => (
                    <FormField
                      key={name}
                      control={control}
                      name={name}
                      render={({ field }) => (
                        <FormItem>
                          <Label>
                            {label} {required && <span className="text-destructive">*</span>}
                          </Label>
                          <Input {...field} placeholder={placeholder} />
                          <p className="text-xs text-muted-foreground">Separate with commas</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
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
                  disabled={!formState.isValid || isPending}
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

export default EditAgency;
