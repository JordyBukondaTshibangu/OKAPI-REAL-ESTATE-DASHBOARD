"use client";

import { Globe, LogOut, Monitor, Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

import { useLanguageStore } from "@/lib/language-store";
import { useTranslation } from "@/hooks/use-translation";
import { removeToken } from "@/lib/auth";
import type { Language } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
      {children}
      <Separator />
    </div>
  );
}

// ─── Pill toggle button ───────────────────────────────────────────────────────

function PillButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all",
        active
          ? "bg-primary text-primary-foreground border-primary shadow-sm"
          : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}

// ─── Settings view ────────────────────────────────────────────────────────────

export default function SettingsView() {
  const t = useTranslation();
  const s = t.settings;
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguageStore();

  const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
    { value: "english", label: s.language.english },
    { value: "french",  label: s.language.french  },
  ];

  const THEME_OPTIONS = [
    { value: "light",  label: s.appearance.light,  icon: Sun     },
    { value: "dark",   label: s.appearance.dark,   icon: Moon    },
    { value: "system", label: s.appearance.system, icon: Monitor },
  ];

  function handleSignOut() {
    removeToken();
    router.push("/login");
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{s.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{s.subtitle}</p>
      </div>

      {/* Language */}
      <Section title={s.language.sectionTitle} description={s.language.sectionDesc}>
        <div className="flex items-center gap-2 flex-wrap">
          {LANGUAGE_OPTIONS.map(({ value, label }) => (
            <PillButton
              key={value}
              active={language === value}
              onClick={() => setLanguage(value)}
              icon={Globe}
              label={label}
            />
          ))}
        </div>
      </Section>

      {/* Appearance */}
      <Section title={s.appearance.sectionTitle} description={s.appearance.sectionDesc}>
        <div className="flex items-center gap-2 flex-wrap">
          {THEME_OPTIONS.map(({ value, label, icon }) => (
            <PillButton
              key={value}
              active={theme === value}
              onClick={() => setTheme(value)}
              icon={icon}
              label={label}
            />
          ))}
        </div>
      </Section>

      {/* Session */}
      <Section title={s.session.sectionTitle} description={s.session.sectionDesc}>
        <div className="flex items-center gap-4">
          <Button
            variant="destructive"
            onClick={handleSignOut}
            className="gap-2"
          >
            <LogOut className="size-4" />
            {s.session.signOut}
          </Button>
          <p className="text-xs text-muted-foreground">{s.session.signOutDesc}</p>
        </div>
      </Section>
    </div>
  );
}
