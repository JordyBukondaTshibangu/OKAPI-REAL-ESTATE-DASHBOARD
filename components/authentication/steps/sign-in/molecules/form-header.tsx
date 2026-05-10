import Image from "next/image";

function SignInFormHeader() {
  return (
    <div className="flex flex-col gap-6 justify-center items-center">
      <p className="text-lg font-normal leading-7 text-muted-foreground">
        Signing into Workspace
      </p>

      <Image
        priority
        width={36}
        height={36}
        alt="ztrust-logo"
        src="/images/ztna-logo.png"
      />

      <div className="flex flex-col gap-3 w-full items-center">
        <h2 className="text-3xl leading-normal font-semibold text-muted-foreground">
          Enter your password
        </h2>

        <p className="text-sm font-normal leading-normal text-muted-foreground">
          Please enter your password to sign in
        </p>
      </div>
    </div>
  );
}

export default SignInFormHeader;
