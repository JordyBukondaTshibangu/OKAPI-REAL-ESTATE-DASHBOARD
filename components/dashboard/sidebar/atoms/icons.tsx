import { type LucideProps } from "lucide-react";
import Image from "next/image";
import { forwardRef } from "react";

export const DashboardIcon = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <Image
      src="/icons/dashboard.svg"
      width={16}
      height={16}
      alt="Dashboard"
      className={props.className}
    />
  ),
);

DashboardIcon.displayName = "DashboardIcon";
