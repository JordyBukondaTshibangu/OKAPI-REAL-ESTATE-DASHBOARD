// Onboarding Error

export type ApiErrorResponse = {
  title: string;
  detail: string;
  instance: string;
  errorCode: string;
  responseTime: string;
  timestamp: number;
  errorParams?: Record<string, string>;
};

export type ApiError = {
  title: string;
  detail: string;
  errorCode: string;
  errorParams?: {
    attemptsLeft?: number;
    canSendOtherAfterUTC?: string;
    time?: string;
  };
};
