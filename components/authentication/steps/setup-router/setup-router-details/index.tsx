import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeftIcon } from "lucide-react";
import { JSX, useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

import Loading from "@/components/feedback/molecules/loading";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

import EntityFormStepOne from "@/components/tenant/common/router-setup/router-details";
import EntityFormStepTwo from "@/components/tenant/common/router-setup/router-installation";
import { MAX_DESCRIPTION_LENGTH } from "@/constants";
import { ADMIN_ONBOARDING_STEPS } from "@/constants/steps";
import { useMultiStepContext } from "@/context/multi-step-navigator/tenant";
import { cn } from "@/lib/utils";
import { AppDispatch, RootState } from "@/store";
import {
  checkRouterExistence,
  createRouter,
  getRouters,
} from "@/store/features/admin/routers/slice";
import { CheckResponse } from "@/types";
import { AddRouterFormValues, refineRouterSchema } from "./schema";

const INITIAL_STEP = 1;

interface StepConfig {
  fields?: Array<keyof AddRouterFormValues>;
  component: JSX.Element;
  isNextDisabled: boolean;
}

function SetUpRouter() {
  const form = useForm<AddRouterFormValues>({
    resolver: zodResolver(refineRouterSchema),
    defaultValues: {
      routerName: "",
      routerDescription: "",
      environmentType: "",
    },
    mode: "onChange",
  });

  const { reset, trigger, watch, formState, control, handleSubmit } = form;

  const dispatch = useDispatch<AppDispatch>();
  const { moveToPreviousStep, setCurrentStep } = useMultiStepContext();

  const { items: routers } = useSelector(
    (state: RootState) => state.adminRouters.routers,
  );

  const [step, setStep] = useState<number>(INITIAL_STEP);
  const [commands, setCommands] = useState<
    { name: string; command: string }[] | null
  >();
  const [loading, setLoading] = useState<boolean>(false);
  const [checkExistingRouter, setCheckExistingRouter] =
    useState<boolean>(false);
  const [isCheckingRouterName, setIsCheckingRouterName] =
    useState<boolean>(false);

  useEffect(() => {
    if (!open) {
      setCheckExistingRouter(false);
      setIsCheckingRouterName(false);
    }
  }, []);

  const routerName = watch("routerName");
  const environmentType = watch("environmentType");
  const routerDescription = watch("routerDescription");

  const isRouterNameDuplicate = useMemo(() => {
    if (!routerName || !routers) return false;

    const normalizedName = routerName.toLowerCase().trim();
    return routers.some(
      (router) =>
        router.name.toLowerCase().trim().replace(/-/g, " ") === normalizedName,
    );
  }, [routerName, routers]);

  const isDescriptionTooLong = useMemo(() => {
    return routerDescription
      ? routerDescription.length > MAX_DESCRIPTION_LENGTH
      : false;
  }, [routerDescription]);

  const isStep1Valid = useMemo(() => {
    return (
      !!routerName &&
      !isDescriptionTooLong &&
      !isRouterNameDuplicate &&
      !formState.errors.routerName &&
      !!environmentType
    );
  }, [
    routerName,
    environmentType,
    isDescriptionTooLong,
    isRouterNameDuplicate,
    formState.errors.routerName,
  ]);

  const steps = useMemo<StepConfig[]>(
    () => [
      {
        fields: ["routerName", "routerDescription", "environmentType"],
        component: (
          <EntityFormStepOne
            control={control}
            formState={formState}
            nameField="routerName"
            descriptionField="routerDescription"
            typeField="environmentType"
            nameLabel="Router Name"
            namePlaceholder="E.g. Router 1"
            descriptionLabel="Router Description"
            descriptionPlaceholder="Add a description for the router (optional)"
            typeLabel="Environment Type"
            isCheckingName={isCheckingRouterName}
            setIsCheckingName={setIsCheckingRouterName}
            nameAlreadyExists={checkExistingRouter}
            setNameAlreadyExists={setCheckExistingRouter}
            onCheckNameExistence={async (name) => {
              const { payload } = await dispatch(
                checkRouterExistence({ name }),
              );
              return payload as CheckResponse;
            }}
          />
        ),
        isNextDisabled: !isStep1Valid,
      },
      {
        component: (
          <EntityFormStepTwo
            commands={commands}
            osSelectorHeading="Operating System"
          />
        ),
        isNextDisabled: false,
      },
    ],
    [
      control,
      commands,
      dispatch,
      formState,
      isStep1Valid,
      checkExistingRouter,
      isCheckingRouterName,
    ],
  );

  useEffect(() => {
    dispatch(getRouters());
  }, [dispatch]);

  const onSubmit = useCallback(
    async (values: AddRouterFormValues) => {
      const { routerName, routerDescription, environmentType } = values;

      if (!routerName || !environmentType) return;

      setLoading(true);

      try {
        const { data } = await dispatch(
          createRouter({
            name: routerName,
            description: routerDescription,
            environmentType: environmentType,
          }),
        ).unwrap();

        if (data && data?.enrollment) {
          setCommands(
            data.enrollment.commands.map((cmd) => ({
              name: cmd.osType,
              command: cmd.script,
            })),
          );
        }

        await dispatch(getRouters());

        toast.success("Router created successfully successfully");

        reset();

        setStep(2);
      } catch (error) {
        console.error("Error creating router:", error);
        toast.error("Failed to create router. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [dispatch, reset],
  );

  const handleNextStep = useCallback(async () => {
    const currentStepConfig = steps[step - 1];

    if (currentStepConfig.fields) {
      const isValid = await trigger(currentStepConfig.fields);
      if (!isValid) return;
    }

    if (step === 1) {
      handleSubmit(onSubmit)();
      return;
    }

    setStep((prev) => prev + 1);

    setCurrentStep(ADMIN_ONBOARDING_STEPS.SETUP_ROUTER_COMPLETE);
  }, [steps, step, setCurrentStep, trigger, handleSubmit, onSubmit]);

  const handlePreviousStep = useCallback(() => {
    if (step > INITIAL_STEP) {
      setStep((prev) => prev - 1);
    }
    moveToPreviousStep();
  }, [step, moveToPreviousStep]);

  const currentStep = steps[step - 1];

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted">
      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="relative flex w-160 max-w-180 min-w-50 flex-col gap-10 rounded-lg border border-t-0 bg-card px-10 py-12 shadow-md"
        >
          <div
            aria-hidden="true"
            className="absolute left-0 top-0 right-1 h-1 w-159.5 rounded-none rounded-tr-3xl bg-border"
          >
            <div className="h-1 w-151 rounded-tl-3xl bg-line-gradient" />
          </div>

          {loading && <Loading label="Creating router..." />}

          <div className="flex flex-col gap-6">
            {step === INITIAL_STEP && (
              <Button
                size="icon"
                type="button"
                variant="outline"
                className="w-8 h-8"
                aria-label="Go back to previous page"
                onClick={handlePreviousStep}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
            )}

            <h2 className="text-3xl leading-normal font-semibold text-card-foreground text-center">
              Set up a router
            </h2>

            <div className="flex flex-col gap-10">
              {currentStep.component}

              <Button
                type="button"
                onClick={handleNextStep}
                disabled={currentStep.isNextDisabled || loading}
                className={cn(
                  "w-18 self-end ",
                  currentStep.isNextDisabled || loading
                    ? ""
                    : "bg-gradient-primary",
                  loading && "opacity-50 cursor-not-allowed",
                )}
              >
                {loading ? "..." : "Next"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default SetUpRouter;
