"use client";
import { Fragment, JSX, Suspense } from "react";

import { ADMIN_ONBOARDING_STEPS } from "@/constants/steps";
import { useMultiStepContext } from "@/context/multi-step-navigator/tenant";
import ConnectIdentityProvider from "./steps/connect-identity-provider";
import CreateAccount from "./steps/create-account";

import SetupRouterComplete from "./steps/setup-router/setup-router-complete";
import SetupRouterDetails from "./steps/setup-router/setup-router-details";
import SetUpRouterInit from "./steps/setup-router/setup-router-init";

import Identification from "./steps/identification";
import OTPVerification from "./steps/otp-verification";
import { ResetPasswordAllDone } from "./steps/reset-password/all-done";
import SetPassword from "./steps/reset-password/set-new-password";
import { AllDone } from "./steps/setup-idp/all-done";
import AppRegistration from "./steps/setup-idp/app-registration";
import { AttributeMapping } from "./steps/setup-idp/attribute-mapping";
import BeforeBeginning from "./steps/setup-idp/before-beginning";
import ConnectionSuccessful from "./steps/setup-idp/connection-status";
import CreatingClientSecret from "./steps/setup-idp/create-client-secret";
import { MicrosoftEntraCredential } from "./steps/setup-idp/microsoft-entra-credentials";
import { RedirectUriStep } from "./steps/setup-idp/redirect-uri";
import { UserProvisioning } from "./steps/setup-idp/user-provisioning";
import VerifyingConnection from "./steps/setup-idp/verifying-connection";
import SignIn from "./steps/sign-in";
import ValidateToken from "./steps/verify-link";

const renderComponent = {
  [ADMIN_ONBOARDING_STEPS.VALIDATE_TOKEN]: <ValidateToken />,

  [ADMIN_ONBOARDING_STEPS.IDENTIFICATION]: <Identification />,

  [ADMIN_ONBOARDING_STEPS.OTP_VERIFICATION]: <OTPVerification />,

  [ADMIN_ONBOARDING_STEPS.CREATE_ACCOUNT]: <CreateAccount />,

  [ADMIN_ONBOARDING_STEPS.CONNECT_IDENTITY_PROVIDER]: (
    <ConnectIdentityProvider />
  ),
  [ADMIN_ONBOARDING_STEPS.BEFORE_BEGINNING]: <BeforeBeginning />,
  [ADMIN_ONBOARDING_STEPS.APP_REGISTRATION]: <AppRegistration />,
  [ADMIN_ONBOARDING_STEPS.VERIFY_CONNECTION]: <VerifyingConnection />,
  [ADMIN_ONBOARDING_STEPS.CONNECTION_STATUS]: <ConnectionSuccessful />,
  [ADMIN_ONBOARDING_STEPS.ATTRIBUTE_MAPPING]: <AttributeMapping />,
  [ADMIN_ONBOARDING_STEPS.CREATE_CLIENT_SECRET]: <CreatingClientSecret />,
  [ADMIN_ONBOARDING_STEPS.MICROSOFT_ENTA_ID_CREDENTIALS]: (
    <MicrosoftEntraCredential />
  ),
  [ADMIN_ONBOARDING_STEPS.REDIRECT_URI]: <RedirectUriStep />,
  [ADMIN_ONBOARDING_STEPS.USER_PROVISIONING]: <UserProvisioning />,
  [ADMIN_ONBOARDING_STEPS.ALL_DONE]: <AllDone />,

  [ADMIN_ONBOARDING_STEPS.SETUP_ROUTER_INIT]: <SetUpRouterInit />,
  [ADMIN_ONBOARDING_STEPS.SETUP_ROUTER_DETAILS]: <SetupRouterDetails />,
  [ADMIN_ONBOARDING_STEPS.SETUP_ROUTER_COMPLETE]: <SetupRouterComplete />,

  [ADMIN_ONBOARDING_STEPS.SIGN_IN]: <SignIn />,

  [ADMIN_ONBOARDING_STEPS.CREATE_NEW_PASSWORD]: <SetPassword />,
  [ADMIN_ONBOARDING_STEPS.RESET_DONE]: <ResetPasswordAllDone />,
};

function Onboarding(): JSX.Element {
  const { currentStep } = useMultiStepContext();

  return (
    <Suspense fallback={<Fragment />}>{renderComponent[currentStep]}</Suspense>
  );
}

export default Onboarding;
