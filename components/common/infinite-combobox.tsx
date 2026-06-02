"use client";

import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type ComboboxItem = { id: string; name: string };

type InfiniteComboboxProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  searchPlaceholder?: string;
  items: ComboboxItem[];
  isLoading?: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onSearch?: (query: string) => void;
  disabled?: boolean;
  className?: string;
};

export function InfiniteCombobox({
  value,
  onChange,
  placeholder,
  searchPlaceholder = "Search…",
  items,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  onSearch,
  disabled,
  className,
}: InfiniteComboboxProps) {
  const [open, setOpen] = useState(false);

  const selectedItem = items.find((item) => item.id === value);

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 80 && hasMore && !isLoadingMore) {
      onLoadMore?.();
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || isLoading}
          className={cn(
            "w-full justify-between font-normal h-9 px-3",
            !selectedItem && "text-muted-foreground",
            className,
          )}
        >
          {isLoading ? (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" /> Loading…
            </span>
          ) : selectedItem ? (
            selectedItem.name
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0"
        style={{ width: "var(--radix-popover-trigger-width)" }}
        align="start"
      >
        <Command filter={onSearch ? () => 1 : undefined}>
          <CommandInput placeholder={searchPlaceholder} onValueChange={onSearch} />
          <CommandList
            onScroll={handleScroll}
            className="max-h-52 overflow-y-auto"
          >
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.name}
                  onSelect={() => {
                    onChange(item.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      value === item.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {item.name}
                </CommandItem>
              ))}
              {isLoadingMore && (
                <div className="flex justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
              {!isLoadingMore && hasMore && (
                <button
                  type="button"
                  onClick={onLoadMore}
                  className="w-full py-2 text-xs text-muted-foreground hover:text-foreground text-center transition-colors"
                >
                  Load more…
                </button>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
