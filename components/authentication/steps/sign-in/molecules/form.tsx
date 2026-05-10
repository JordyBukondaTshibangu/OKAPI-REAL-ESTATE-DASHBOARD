"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { z } from "zod";

import Loading from "@/components/feedback/molecules/loading";
import DialogInfo from "@/components/tenant/common/info";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { ONBOARDING_STATE_CODES } from "@/constants/onboarding";
import { useMultiStepContext } from "@/context/multi-step-navigator/tenant";
import { cn } from "@/lib/utils";
import { AppDispatch } from "@/store";
import { signIn } from "@/store/features/admin/auth/slice";
import { ApiError } from "@/types/error";

const { SESSION_EXPIRED } = ONBOARDING_STATE_CODES;

const formSchema = z.object({
  password: z.string().min(1),
});

function SignInForm() {
  const dispatch = useDispatch<AppDispatch>();
  const session = localStorage.getItem("session");

  const router = useRouter();

  const { moveToNextStep } = useMultiStepContext();

  const [loading, setLoading] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
    mode: "onChange",
  });

  const { handleSubmit, control, formState, clearErrors } = form;

  const onSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      setLoading(true);

      try {
        if (!session) return;

        const response = await dispatch(
          signIn({ password: values.password, session }),
        ).unwrap();

        clearErrors("password");

        setErrorMessage(null);

        if (response?.data) {
          router.push("/dashboard");
        } else {
          setLoading(false);
          setErrorMessage("Invalid Login Credentials");
        }
      } catch (err) {
        setLoading(false);

        setErrorMessage("Sign In failed. Please try again.");
        console.error("Sign In Request failed:", err);

        const apiError = err as ApiError;

        if (apiError.errorCode === SESSION_EXPIRED.code) {
          setShowDialog(true);
        }

        toast.error("Something went wrong. Please try again.");
      }
    },
    [clearErrors, dispatch, router, session],
  );

  return (
    <>
      {loading ? <Loading label="Signing In" /> : null}

      {showDialog && (
        <DialogInfo
          open={showDialog}
          buttonText="Restart"
          title="Session Expired"
          onOpenChange={() => window.location.reload()}
          description="Your current session has timed out due to inactivity. Tap below to restart"
        />
      )}

      <Form {...form}>
        <form
          className="flex flex-col gap-10 w-full"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col gap-4">
            <FormField
              control={control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <Label>Password</Label>
                  <div className="relative">
                    <FormControl>
                      <Input
                        autoFocus
                        id="password"
                        placeholder="Enter your password"
                        type={showPassword ? "text" : "password"}
                        className={cn(
                          "w-full text-muted-foreground",

                          errorMessage
                            ? "border-destructive! focus:border-destructive! focus:ring-destructive/20!"
                            : "border-border! focus:border-ring! focus-visible:ring-ring/20!",
                        )}
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;

                          field.onChange(e);

                          if (!value) setErrorMessage(null);
                        }}
                      />
                    </FormControl>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  <span className="h-5 text-destructive text-sm">
                    {field.value && errorMessage && (
                      <FormMessage className="text-destructive text-sm">
                        Invalid password
                      </FormMessage>
                    )}
                  </span>
                </FormItem>
              )}
            />

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 invisible peer-data-[error]:visible">
                <Checkbox id="remember" className="w-4 h-4" />
                <Label
                  htmlFor="remember"
                  className="text-sm font-normal leading-none text-muted-foreground"
                >
                  Keep me signed in
                </Label>
              </div>
              <Button
                type="button"
                variant="link"
                onClick={() => moveToNextStep()}
                className="h-5 text-sm leading-normal font-normal text-muted-foreground self-end"
              >
                Forgot Password?
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            className={cn(
              "self-end min-w-[85px]",
              formState.isValid
                ? "bg-gradient-primary hover:bg-gradient-secondary"
                : "bg-slate-400 text-primary-foreground cursor-not-allowed",
            )}
            disabled={!formState.isValid}
          >
            Sign In
          </Button>
        </form>
      </Form>
    </>
  );
}

export default SignInForm;
