"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import DialogDiscard from "@/components/common/discard";
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
import { Textarea } from "@/components/ui/textarea";
import { MAX_DESCRIPTION_LENGTH } from "@/constants";
import { useCreateProperty } from "@/lib/queries/properties";
import { cn } from "@/lib/utils";
import { AddPropertyFormValues, addPropertySchema } from "./schema";

type AddPropertyProps = {
  open: boolean;
  resetCurrentPage?: () => void;
  setToggle: (open: boolean) => void;
};

const LISTING_TYPES = ["rent", "sale", "commercial"] as const;
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

function AddProperty({ open, setToggle, resetCurrentPage }: AddPropertyProps) {
  const { mutateAsync: createProperty, isPending } = useCreateProperty();
  const [openDiscard, setOpenDiscard] = useState(false);

  const form = useForm<AddPropertyFormValues>({
    resolver: zodResolver(addPropertySchema),
    defaultValues: {
      title: "",
      listingType: "sale",
      category: "apartment",
      price: 0,
      currency: "USD",
      city: "",
      suburb: "",
      description: "",
    },
    mode: "onChange",
  });

  const { reset, handleSubmit, control, watch, formState } = form;

  const onSubmit = useCallback(
    async (values: AddPropertyFormValues) => {
      try {
        await createProperty(values);
        toast.success("Property created successfully");
        reset();
        setToggle(false);
        resetCurrentPage?.();
      } catch {
        toast.error("Failed to create property. Please try again.");
      }
    },
    [createProperty, reset, setToggle, resetCurrentPage],
  );

  function handleDialogChange(nextOpen: boolean) {
    if (formState.isDirty || watch("title")) {
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
        <Loading label="Creating property" />
      ) : (
        <Dialog open={open} onOpenChange={handleDialogChange}>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogContent className="sm:max-w-lg flex flex-col gap-6">
                <DialogHeader>
                  <DialogTitle>Add Property</DialogTitle>
                  <DialogDescription>
                    Fill in the details to create a new listing.
                  </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                  <FormField
                    control={control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <Label>
                          Title <span className="text-destructive">*</span>
                        </Label>
                        <Input {...field} placeholder="Property title" />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="w-full grid grid-cols-2 gap-4">
                    <FormField
                      control={control}
                      name="listingType"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <Label>Listing type</Label>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {LISTING_TYPES.map((t) => (
                                <SelectItem
                                  key={t}
                                  value={t}
                                  className="capitalize"
                                >
                                  {t}
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
                        <FormItem className="w-full">
                          <Label>Category</Label>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
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
                  </div>

                  <div className="w-full grid grid-cols-2 gap-4">
                    <FormField
                      control={control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <Label>
                            Price <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            {...field}
                            type="number"
                            min={0}
                            placeholder="0"
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
                          <Label>Currency</Label>
                          <Input {...field} placeholder="USD" />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <Label>
                            City <span className="text-destructive">*</span>
                          </Label>
                          <Input {...field} placeholder="City" />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="suburb"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Suburb</Label>
                          <Input {...field} placeholder="Suburb" />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={control}
                    name="description"
                    render={({ field }) => {
                      const currentLength = field.value?.length || 0;
                      const exceeded = currentLength > MAX_DESCRIPTION_LENGTH;
                      return (
                        <FormItem>
                          <Label>Description</Label>
                          <Textarea
                            {...field}
                            value={field.value ?? ""}
                            className={cn("h-24", {
                              "border-destructive": exceeded,
                            })}
                            placeholder="Describe the property (optional)"
                          />
                          <div className="flex justify-end">
                            <span
                              className={cn("text-muted-foreground text-xs", {
                                "text-destructive": exceeded,
                              })}
                            >
                              {currentLength}/{MAX_DESCRIPTION_LENGTH}
                            </span>
                          </div>
                        </FormItem>
                      );
                    }}
                  />
                </div>

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
                    Create Property
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

export default AddProperty;
