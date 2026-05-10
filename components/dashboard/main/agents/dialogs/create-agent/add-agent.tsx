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
import { useCreateAgent } from "@/lib/queries/agents";
import { addAgentSchema, AddAgentFormValues } from "./schema";

type AddAgentProps = {
  open: boolean;
  resetCurrentPage?: () => void;
  setToggle: (open: boolean) => void;
};

function AddAgent({ open, setToggle, resetCurrentPage }: AddAgentProps) {
  const { mutateAsync: createAgent, isPending } = useCreateAgent();
  const [openDiscard, setOpenDiscard] = useState(false);

  const form = useForm<AddAgentFormValues>({
    resolver: zodResolver(addAgentSchema),
    defaultValues: { name: "", specialization: "", agency: "", nationality: "", bio: "" },
    mode: "onChange",
  });

  const { reset, handleSubmit, control, watch, formState } = form;

  const onSubmit = useCallback(
    async (values: AddAgentFormValues) => {
      try {
        const payload = { ...values, bio: values.bio ?? undefined };
      await createAgent(payload);
        toast.success("Agent created successfully");
        reset();
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
    setToggle(false);
    setOpenDiscard(false);
  }

  return (
    <>
      {isPending ? (
        <Loading label="Creating agent" />
      ) : (
        <Dialog open={open} onOpenChange={handleDialogChange}>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogContent className="sm:max-w-lg flex flex-col gap-6">
                <DialogHeader>
                  <DialogTitle>Add Agent</DialogTitle>
                  <DialogDescription>Fill in the details to create a new agent.</DialogDescription>
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
                        <Input {...field} placeholder="Enter agent name" />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="specialization"
                    render={({ field }) => (
                      <FormItem>
                        <Label>
                          Specialization <span className="text-destructive">*</span>
                        </Label>
                        <Input {...field} placeholder="e.g. Residential, Commercial" />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="agency"
                    render={({ field }) => (
                      <FormItem>
                        <Label>
                          Agency <span className="text-destructive">*</span>
                        </Label>
                        <Input {...field} placeholder="Agency name" />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="nationality"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Nationality</Label>
                        <Input {...field} placeholder="e.g. French" />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="bio"
                    render={({ field }) => {
                      const currentLength = field.value?.length || 0;
                      const exceeded = currentLength > MAX_DESCRIPTION_LENGTH;
                      return (
                        <FormItem>
                          <Label>Bio</Label>
                          <Textarea
                            {...field}
                            value={field.value ?? ""}
                            className={cn("h-24", { "border-destructive": exceeded })}
                            placeholder="Short bio (optional)"
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
