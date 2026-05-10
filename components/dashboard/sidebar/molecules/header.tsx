import Image from "next/image";

function SideBarHeaderContent() {
  return (
    <div className="px-2 flex items-center justify-start gap-2 w-full h-full">
      <div className="relative w-24 h-24">
        <Image
          src="/assets/images/company-logo.png"
          alt="Okapi logo"
          sizes="100%"
          loading="eager"
          fill
          className="object-contain"
        />
      </div>
    </div>
  );
}

export default SideBarHeaderContent;
