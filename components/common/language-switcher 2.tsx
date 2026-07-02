"use client";

import { Globe } from "lucide-react";
import { useLanguageStore } from "@/lib/language-store";
import type { Language } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const LANGUAGES: { value: Language; label: string; short: string }[] = [
  { value: "english", label: "English", short: "EN" },
  { value: "french", label: "Français", short: "FR" },
];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguageStore();
  const current = LANGUAGES.find((l) => l.value === language)!;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <Globe className="size-3.5" />
          {current.short}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-36">
        {LANGUAGES.map(({ value, label, short }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setLanguage(value)}
            className={cn(
              "cursor-pointer gap-2",
              language === value && "font-semibold text-foreground",
            )}
          >
            <span className="text-[11px] font-mono text-muted-foreground w-6">
              {short}
            </span>
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
