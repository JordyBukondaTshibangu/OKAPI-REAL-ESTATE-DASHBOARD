import OTPAction from "./molecules/otp-action";
import OTPHeader from "./molecules/otp-header";
import OTPInput from "./molecules/otp-input";

function OTP() {
  return (
    <div className="w-full flex items-center justify-center min-h-screen bg-muted">
      <div className="relative max-w-150 min-w-50 w-130 min-h-94 mx-auto flex flex-col items-center justify-between py-10 px-12 gap-14 rounded-lg border border-t-0 bg-card shadow-[0_4px_6px_-1px_rgba(0,0,0,0.10),0_2px_4px_-2px_rgba(0,0,0,0.10)]">
        <div className="absolute top-0 rounded-none left-0 w-129 h-1 items-center bg-border rounded-tr-3xl right-1">
          <div className="w-59 h-1 bg-line-gradient rounded-tl-3xl"></div>
        </div>

        <div className="w-full flex flex-col gap-10">
          <OTPHeader />
          <OTPInput />
        </div>

        <OTPAction />
      </div>
    </div>
  );
}

export default OTP;
