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
import { useCreateAgent } from "@/lib/queries/agents";
import { useAgencies } from "@/lib/queries/agencies";
import { addAgentSchema, AddAgentFormValues } from "./schema";

const AGENT_TITLES = ["SUPERAGENT", "AGENT EXCLUSIF", "AGENT"] as const;
const currentYear = new Date().getFullYear();

type AddAgentProps = {
  open: boolean;
  resetCurrentPage?: () => void;
  setToggle: (open: boolean) => void;
};

function AddAgent({ open, setToggle, resetCurrentPage }: AddAgentProps) {
  const { mutateAsync: createAgent, isPending } = useCreateAgent();
  const { data: agenciesData, isLoading: agenciesLoading } = useAgencies({ pageSize: 200 });
  const [openDiscard, setOpenDiscard] = useState(false);

  const form = useForm<AddAgentFormValues>({
    resolver: zodResolver(addAgentSchema),
    defaultValues: {
      agencyId: "",
      name: "",
      title: "AGENT",
      specialization: "",
      nationality: "",
      languages: "",
      yearsExperience: 0,
      experienceSince: currentYear,
      rating: 0,
      ratingsCount: 0,
      responseMinutes: 0,
      brokerLicense: "",
      bio: "",
      photo: "",
      photoGradient: "",
      agencyAccent: "",
      agencyMonogram: "",
    },
    mode: "onChange",
  });

  const { reset, handleSubmit, control, watch, formState, setValue } = form;

  const onSubmit = useCallback(
    async (values: AddAgentFormValues) => {
      try {
        const payload = {
          ...values,
          languages: values.languages
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        };
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

  const agencies = agenciesData?.data ?? [];

  return (
    <>
      {isPending ? (
        <Loading label="Creating agent" />
      ) : (
        <Dialog open={open} onOpenChange={handleDialogChange}>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogContent className="sm:max-w-xl min-w-[850px] flex flex-col gap-4 max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>Add Agent</DialogTitle>
                  <DialogDescription>
                    Fill in all details to create a new agent.
                  </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 overflow-y-auto pr-1">
                  <div className="flex flex-col gap-4 pb-2">
                    {/* Agency dropdown */}
                    <FormField
                      control={control}
                      name="agencyId"
                      render={({ field }) => (
                        <FormItem>
                          <Label>
                            Agency <span className="text-destructive">*</span>
                          </Label>
                          <Select
                            disabled={agenciesLoading}
                            onValueChange={(value) => {
                              field.onChange(value);
                              const agency = agencies.find((a) => a.id === value);
                              if (agency) {
                                setValue("agencyAccent", agency.accentClass, { shouldValidate: true });
                                setValue("agencyMonogram", agency.monogram, { shouldValidate: true });
                              }
                            }}
                            value={field.value}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue
                                placeholder={
                                  agenciesLoading ? "Loading agencies…" : "Select an agency"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {agencies.map((agency) => (
                                <SelectItem key={agency.id} value={agency.id}>
                                  {agency.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Identity */}
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <Label>
                              Full name <span className="text-destructive">*</span>
                            </Label>
                            <Input {...field} placeholder="John Smith" />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <Label>
                              Title <span className="text-destructive">*</span>
                            </Label>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {AGENT_TITLES.map((t) => (
                                  <SelectItem key={t} value={t}>
                                    {t}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={control}
                        name="specialization"
                        render={({ field }) => (
                          <FormItem>
                            <Label>
                              Specialization <span className="text-destructive">*</span>
                            </Label>
                            <Input {...field} placeholder="Residential" />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="nationality"
                        render={({ field }) => (
                          <FormItem>
                            <Label>
                              Nationality <span className="text-destructive">*</span>
                            </Label>
                            <Input {...field} placeholder="French" />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

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
                      name="brokerLicense"
                      render={({ field }) => (
                        <FormItem>
                          <Label>
                            Broker license <span className="text-destructive">*</span>
                          </Label>
                          <Input {...field} placeholder="BRN-123456" />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3">
                      <FormField
                        control={control}
                        name="yearsExperience"
                        render={({ field }) => (
                          <FormItem>
                            <Label>
                              Years exp. <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              {...field}
                              type="number"
                              min={0}
                              placeholder="5"
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="experienceSince"
                        render={({ field }) => (
                          <FormItem>
                            <Label>
                              Since (year) <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              {...field}
                              type="number"
                              min={1900}
                              max={currentYear}
                              placeholder="2019"
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="responseMinutes"
                        render={({ field }) => (
                          <FormItem>
                            <Label>
                              Response (min) <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              {...field}
                              type="number"
                              min={0}
                              placeholder="30"
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={control}
                        name="rating"
                        render={({ field }) => (
                          <FormItem>
                            <Label>
                              Rating (0–5) <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              {...field}
                              type="number"
                              min={0}
                              max={5}
                              step={0.1}
                              placeholder="4.8"
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="ratingsCount"
                        render={({ field }) => (
                          <FormItem>
                            <Label>
                              Ratings count <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              {...field}
                              type="number"
                              min={0}
                              placeholder="120"
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Media */}
                    <FormField
                      control={control}
                      name="photo"
                      render={({ field }) => (
                        <FormItem>
                          <Label>
                            Photo URL <span className="text-destructive">*</span>
                          </Label>
                          <Input {...field} placeholder="https://example.com/photo.jpg" />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="photoGradient"
                      render={({ field }) => (
                        <FormItem>
                          <Label>
                            Photo gradient <span className="text-destructive">*</span>
                          </Label>
                          <Input {...field} placeholder="from-blue-400 to-blue-600" />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={control}
                        name="agencyAccent"
                        render={({ field }) => (
                          <FormItem>
                            <Label>
                              Agency accent <span className="text-destructive">*</span>
                            </Label>
                            <Input {...field} placeholder="bg-blue-600" />
                            <p className="text-xs text-muted-foreground">Auto-filled from agency</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="agencyMonogram"
                        render={({ field }) => (
                          <FormItem>
                            <Label>
                              Agency monogram <span className="text-destructive">*</span>
                            </Label>
                            <Input {...field} placeholder="CB" />
                            <p className="text-xs text-muted-foreground">Auto-filled from agency</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Bio */}
                    <FormField
                      control={control}
                      name="bio"
                      render={({ field }) => {
                        const len = field.value?.length ?? 0;
                        const exceeded = len > MAX_DESCRIPTION_LENGTH;
                        return (
                          <FormItem>
                            <Label>
                              Bio <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                              {...field}
                              value={field.value ?? ""}
                              className={cn("h-24", { "border-destructive": exceeded })}
                              placeholder="Short professional bio"
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
                            <FormMessage />
                          </FormItem>
                        );
                      }}
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
