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
import { Textarea } from "@/components/ui/textarea";
import DialogDiscard from "@/components/common/discard";
import { Loading } from "@/components/common/loading";
import { cn } from "@/lib/utils";
import { MAX_DESCRIPTION_LENGTH } from "@/constants";
import { useCreateAgency } from "@/lib/queries/agencies";
import { addAgencySchema, AddAgencyFormValues } from "./schema";

type AddAgencyProps = {
  open: boolean;
  resetCurrentPage?: () => void;
  setToggle: (open: boolean) => void;
};

function AddAgency({ open, setToggle, resetCurrentPage }: AddAgencyProps) {
  const { mutateAsync: createAgency, isPending } = useCreateAgency();
  const [openDiscard, setOpenDiscard] = useState(false);

  const form = useForm<AddAgencyFormValues>({
    resolver: zodResolver(addAgencySchema),
    defaultValues: { name: "", tagline: "", email: "", phone: "", address: "", description: "" },
    mode: "onChange",
  });

  const { reset, handleSubmit, control, watch, formState } = form;

  const onSubmit = useCallback(
    async (values: AddAgencyFormValues) => {
      try {
        const payload = { ...values, description: values.description ?? undefined };
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
              <DialogContent className="sm:max-w-lg flex flex-col gap-6">
                <DialogHeader>
                  <DialogTitle>Add Agency</DialogTitle>
                  <DialogDescription>Fill in the details to create a new agency.</DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                  <FormField
                    control={control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <Label>
                          Name <span className="text-destructive">*</span>
                        </Label>
                        <Input {...field} placeholder="Enter agency name" />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="tagline"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Tagline</Label>
                        <Input {...field} placeholder="Short tagline" />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Email</Label>
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
                        <Label>Phone</Label>
                        <Input {...field} placeholder="+1 234 567 8900" />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Address</Label>
                        <Input {...field} placeholder="Street address" />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                            className={cn("h-24", { "border-destructive": exceeded })}
                            placeholder="Describe the agency (optional)"
                          />
                          <div className="flex justify-end">
                            <span className={cn("text-muted-foreground text-xs", { "text-destructive": exceeded })}>
                              {currentLength}/{MAX_DESCRIPTION_LENGTH}
                            </span>
                          </div>
                        </FormItem>
                      );
                    }}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => handleDialogChange(false)}>
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
