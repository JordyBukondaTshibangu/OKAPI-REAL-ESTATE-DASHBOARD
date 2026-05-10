import Image from "next/image";

export default function CreateAccountFormHeader() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 text-center">
      <Image
        src="/images/ztna-logo.png"
        width={36}
        height={36}
        alt="Okapi Real Estate logo"
      />

      <div className="flex flex-col items-center gap-3">
        <h2 className="text-3xl font-semibold leading-normal text-muted-foreground">
          Create account
        </h2>
        <p className="text-sm text-muted-foreground">
          Set up Okapi Real Estate and secure access to your digital ecosystem
        </p>
      </div>
    </div>
  );
}
