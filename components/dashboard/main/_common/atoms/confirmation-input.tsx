import { Dispatch, SetStateAction } from "react";

import { Input } from "@/components/ui/input";

import { cn } from "@/lib/utils";

type ConfirmInputProps = {
  type: "TEAM" | "RESOURCE";
  name: string;
  instanceName: string;
  setInstanceName: Dispatch<SetStateAction<string>>;
};

function ConfirmationInput({
  type,
  instanceName,
  setInstanceName,
  name,
}: ConfirmInputProps) {
  const renderMessage =
    type === "TEAM" ? "Incorrect team name" : "Incorrect resource name";
  return (
    <div className="w-full flex flex-col gap-2">
      <Input
        type="text"
        value={instanceName}
        placeholder={type === "TEAM" ? "Team name" : "Resource name"}
        className={cn(
          "w-full",
          instanceName &&
            instanceName !== name &&
            "border-destructive focus-within:border-destructive focus-within:ring-destructive/20 focus-visible:border-destructive focus-visible:ring-destructive/20 dark:focus-visible:border-destructive dark:focus-visible:ring-destructive/40"
        )}
        onChange={(e) => setInstanceName(e.target.value)}
      />
      <span className="h-5 text-destructive text-sm leading-normal">
        {instanceName && instanceName !== name && renderMessage}
      </span>
    </div>
  );
}

export default ConfirmationInput;
