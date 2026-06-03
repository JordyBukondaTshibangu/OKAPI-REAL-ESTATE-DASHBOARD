"use client";

import { useCallback, useState } from "react";
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
import { useCreateAgency } from "@/lib/queries/agencies";
import { useTranslation } from "@/hooks/use-translation";
import { addAgencySchema, AddAgencyFormValues } from "./schema";

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
];

const currentYear = new Date().getFullYear();

type AddAgencyProps = {
  open: boolean;
  resetCurrentPage?: () => void;
  setToggle: (open: boolean) => void;
};

function splitTrim(val: string): string[] {
  return val.split(",").map((s) => s.trim()).filter(Boolean);
}

function AddAgency({ open, setToggle, resetCurrentPage }: AddAgencyProps) {
  const t = useTranslation();
  const f = t.forms.agency;

  const { mutateAsync: createAgency, isPending } = useCreateAgency();
  const [openDiscard, setOpenDiscard] = useState(false);

  const form = useForm<AddAgencyFormValues>({
    resolver: zodResolver(addAgencySchema),
    defaultValues: {
      name: "",
      monogram: "",
      accentClass: "",
      tagline: "",
      description: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      founded: currentYear,
      specializations: "",
      areasServed: "",
      languages: "",
      certifications: "",
    },
    mode: "onChange",
  });

  const { reset, handleSubmit, control, watch, formState } = form;

  const onSubmit = useCallback(
    async (values: AddAgencyFormValues) => {
      try {
        const payload = {
          ...values,
          website: values.website || undefined,
          specializations: splitTrim(values.specializations),
          areasServed: splitTrim(values.areasServed),
          languages: splitTrim(values.languages),
          certifications: values.certifications ? splitTrim(values.certifications) : [],
        };
        await createAgency(payload);
        toast.success(f.toast.created);
        reset();
        setToggle(false);
        resetCurrentPage?.();
      } catch {
        toast.error(f.toast.createFailed);
      }
    },
    [createAgency, reset, setToggle, resetCurrentPage, f],
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
    setToggle(false);
    setOpenDiscard(false);
  }

  return (
    <>
      {isPending ? (
        <Loading label={f.loading.creating} />
      ) : (
        <Dialog open={open} onOpenChange={handleDialogChange}>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogContent className="sm:max-w-xl min-w-[850px] flex flex-col gap-4 max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>{f.addTitle}</DialogTitle>
                  <DialogDescription>{f.addDesc}</DialogDescription>
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
                            <Label>
                              {f.labels.name} <span className="text-destructive">*</span>
                            </Label>
                            <Input {...field} placeholder={f.placeholders.name} />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="monogram"
                        render={({ field }) => (
                          <FormItem>
                            <Label>
                              {f.labels.monogram} <span className="text-destructive">*</span>
                            </Label>
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
                            <Label>
                              {f.labels.accentColor} <span className="text-destructive">*</span>
                            </Label>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="w-full">
                                <div className="flex items-center gap-2 min-w-0">
                                  {field.value && (
                                    <span className={cn("inline-block shrink-0 w-3 h-3 rounded-full", field.value)} />
                                  )}
                                  <SelectValue placeholder={f.placeholders.pickColor} />
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
                            <Label>
                              {f.labels.founded} <span className="text-destructive">*</span>
                            </Label>
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
                          <Label>
                            {f.labels.tagline} <span className="text-destructive">*</span>
                          </Label>
                          <Input {...field} placeholder={f.placeholders.tagline} />
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
                            <Label>
                              {f.labels.email} <span className="text-destructive">*</span>
                            </Label>
                            <Input {...field} type="email" placeholder={f.placeholders.email} />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <Label>
                              {f.labels.phone} <span className="text-destructive">*</span>
                            </Label>
                            <Input {...field} placeholder={f.placeholders.phone} />
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
                          <Label>
                            {f.labels.address} <span className="text-destructive">*</span>
                          </Label>
                          <Input {...field} placeholder={f.placeholders.address} />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <Label>{f.labels.website}</Label>
                          <Input {...field} placeholder={f.placeholders.website} />
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
                            <Label>
                              {f.labels.description} <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                              {...field}
                              className={cn("h-24", { "border-destructive": exceeded })}
                              placeholder={f.placeholders.description}
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
                      { name: "specializations" as const, label: f.labels.specializations, placeholder: f.placeholders.specializations, required: true },
                      { name: "areasServed"      as const, label: f.labels.areasServed,      placeholder: f.placeholders.areasServed,      required: true },
                      { name: "languages"        as const, label: f.labels.languages,        placeholder: f.placeholders.languages,        required: true },
                      { name: "certifications"   as const, label: f.labels.certifications,   placeholder: f.placeholders.certifications,   required: false },
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
                            <p className="text-xs text-muted-foreground">{f.hints.separateWithCommas}</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </ScrollArea>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => handleDialogChange(false)}>
                    {t.forms.common.cancel}
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-primary"
                    onClick={handleSubmit(onSubmit)}
                    disabled={!formState.isValid || isPending}
                  >
                    {f.createBtn}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </form>
          </Form>
        </Dialog>
      )}

      <DialogDiscard
        open={openDiscard}
        title={f.discard.title}
        onDiscard={handleDiscard}
        onOpenChange={setOpenDiscard}
        onClose={() => setOpenDiscard(false)}
        description={f.discard.description}
      />
    </>
  );
}

export default AddAgency;
