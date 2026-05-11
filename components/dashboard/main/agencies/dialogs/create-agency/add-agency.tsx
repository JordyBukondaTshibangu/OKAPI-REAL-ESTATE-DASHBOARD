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
import { addAgencySchema, AddAgencyFormValues } from "./schema";

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
];

const currentYear = new Date().getFullYear();

type AddAgencyProps = {
  open: boolean;
  resetCurrentPage?: () => void;
  setToggle: (open: boolean) => void;
};

function splitTrim(val: string): string[] {
  return val
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function AddAgency({ open, setToggle, resetCurrentPage }: AddAgencyProps) {
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
        toast.success("Agency created successfully");
        reset();
        setToggle(false);
        resetCurrentPage?.();
      } catch {
        toast.error("Failed to create agency. Please try again.");
      }
    },
    [createAgency, reset, setToggle, resetCurrentPage],
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
        <Loading label="Creating agency" />
      ) : (
        <Dialog open={open} onOpenChange={handleDialogChange}>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogContent className="sm:max-w-xl min-w-[850px] flex flex-col gap-4 max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>Add Agency</DialogTitle>
                  <DialogDescription>
                    Fill in all details to create a new agency.
                  </DialogDescription>
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
                              Name <span className="text-destructive">*</span>
                            </Label>
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
                            <Label>
                              Monogram <span className="text-destructive">*</span>
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
                              Accent color <span className="text-destructive">*</span>
                            </Label>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pick a color" />
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
                              Founded <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              {...field}
                              type="number"
                              min={1800}
                              max={currentYear}
                              placeholder="2005"
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
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
                            Tagline <span className="text-destructive">*</span>
                          </Label>
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
                            <Label>
                              Email <span className="text-destructive">*</span>
                            </Label>
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
                            <Label>
                              Phone <span className="text-destructive">*</span>
                            </Label>
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
                          <Label>
                            Address <span className="text-destructive">*</span>
                          </Label>
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
                            <Label>
                              Description <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                              {...field}
                              className={cn("h-24", { "border-destructive": exceeded })}
                              placeholder="Describe the agency"
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

                    {/* Arrays — comma-separated */}
                    <FormField
                      control={control}
                      name="specializations"
                      render={({ field }) => (
                        <FormItem>
                          <Label>
                            Specializations <span className="text-destructive">*</span>
                          </Label>
                          <Input {...field} placeholder="Residential, Commercial, Luxury" />
                          <p className="text-xs text-muted-foreground">Separate with commas</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="areasServed"
                      render={({ field }) => (
                        <FormItem>
                          <Label>
                            Areas served <span className="text-destructive">*</span>
                          </Label>
                          <Input {...field} placeholder="Downtown, Suburbs, Coastal" />
                          <p className="text-xs text-muted-foreground">Separate with commas</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                      name="certifications"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Certifications</Label>
                          <Input {...field} placeholder="ISO 9001, RICS, NAR" />
                          <p className="text-xs text-muted-foreground">Separate with commas</p>
                          <FormMessage />
                        </FormItem>
                      )}
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
                    disabled={!formState.isValid || isPending}
                  >
                    Create Agency
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

export default AddAgency;
