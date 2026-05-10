import { ChevronDown, Search, SearchIcon, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { cn } from "@/lib/utils";
import { QueryParams, SEARCH_TYPE } from "@/types";

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export type ActivityFilterProps = {
  type: SEARCH_TYPE;
  options?: string[];
  setCurrentPage: React.Dispatch<React.SetStateAction<number>> | ((page: number) => void);
  reset: () => void;
  setParams: (params: QueryParams) => void;
};

function SearchInput({
  type,
  reset,
  options,
  setParams,
  setCurrentPage,
}: ActivityFilterProps) {
  const [searchInput, setSearchInput] = useState<string>("");
  const [openPopover, setOpenPopover] = useState<boolean>(false);
  const [appliedSearchQuery, setAppliedSearchQuery] = useState<string>("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const lastAppliedParams = useRef<string>("");
  const isInitialMount = useRef(true);

  const defaultOption = useMemo(() => {
    if (type === SEARCH_TYPE.MEMBER && options?.includes("Email")) {
      return "Email";
    }

    if (
      (type === SEARCH_TYPE.RESOURCE ||
        type === SEARCH_TYPE.POLICY ||
        type === SEARCH_TYPE.ROUTER ||
        type === SEARCH_TYPE.TEAM ||
        type === SEARCH_TYPE.AGENT ||
        type === SEARCH_TYPE.AGENCY ||
        type === SEARCH_TYPE.PROPERTY) &&
      options?.includes("Name")
    ) {
      return "Name";
    }

    return null;
  }, [type, options]);

  // Get the effective search option (selected or default)
  const effectiveSearchOption = useMemo(() => {
    return selectedOption ?? defaultOption;
  }, [selectedOption, defaultOption]);

  // Build query parameters
  const buildQueryParams = useCallback((): QueryParams => {
    const params: QueryParams = {};

    if (appliedSearchQuery.trim()) {
      if (type === SEARCH_TYPE.TEAM) {
        const option = effectiveSearchOption;
        if (option === "Name") {
          params.searchName = appliedSearchQuery.trim();
        } else {
          params.search = appliedSearchQuery.trim();
        }
      }

      // For member search, determine which param to use based on the option
      if (type === SEARCH_TYPE.MEMBER) {
        const option = effectiveSearchOption;
        if (option === "Email") {
          params.search = appliedSearchQuery.trim();
        } else if (option === "Name") {
          params.searchName = appliedSearchQuery.trim();
        }
      }

      // For resource search, determine which param to use based on the option
      else if (type === SEARCH_TYPE.RESOURCE) {
        const option = effectiveSearchOption;
        if (option === "Name") {
          params.searchName = appliedSearchQuery.trim();
        } else if (option === "IP/Address") {
          params.searchAddrs = appliedSearchQuery.trim();
        } else {
          params.search = appliedSearchQuery.trim();
        }
      }

      // For policy search, determine which param to use based on the option
      else if (type === SEARCH_TYPE.POLICY) {
        const option = effectiveSearchOption;
        if (option === "Name") {
          params.searchName = appliedSearchQuery.trim();
        } else {
          params.search = appliedSearchQuery.trim();
        }
      }

      // For router search, determine which param to use based on the option
      else if (type === SEARCH_TYPE.ROUTER) {
        const option = effectiveSearchOption;
        if (option === "Name") {
          params.searchName = appliedSearchQuery.trim();
        } else if (option === "Region") {
          params.searchRegion = appliedSearchQuery.trim();
        } else {
          params.search = appliedSearchQuery.trim();
        }
      } else if (
        type === SEARCH_TYPE.AGENT ||
        type === SEARCH_TYPE.AGENCY ||
        type === SEARCH_TYPE.PROPERTY
      ) {
        if (effectiveSearchOption === "Name") {
          params.searchName = appliedSearchQuery.trim();
        } else {
          params.search = appliedSearchQuery.trim();
        }
      } else {
        params.search = appliedSearchQuery.trim();
      }
    }

    return params;
  }, [appliedSearchQuery, effectiveSearchOption, type]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const params = buildQueryParams();
    const paramsString = JSON.stringify(params);

    // This ensures we only update the parent if the search logic actually changed
    if (paramsString !== lastAppliedParams.current) {
      lastAppliedParams.current = paramsString;
      setParams(params);
      // Remove setCurrentPage(1) from here if you want to keep the page
      // persistent, but usually 1 is correct for a NEW search.
    }
  }, [buildQueryParams, setParams]);

  // Handle search execution
  const handleSearch = useCallback(() => {
    const trimmedInput = searchInput.trim();
    if (trimmedInput) {
      setAppliedSearchQuery(trimmedInput);
    }
  }, [searchInput]);

  // Handle Enter key in search input
  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSearch();
      }
    },
    [handleSearch],
  );

  // Handle option selection
  const handleSelect = useCallback((option: string) => {
    setSelectedOption((prev) => (prev === option ? null : option));
    setOpenPopover(false);
  }, []);

  const clearDisplayOption = useCallback(() => {
    setSelectedOption(null);
    setAppliedSearchQuery("");
    setParams({});
    setCurrentPage(1);
    lastAppliedParams.current = JSON.stringify({});
  }, [setParams, setCurrentPage]);

  // Clear only the search text
  const handleClearSearch = useCallback(() => {
    setSearchInput("");
    setAppliedSearchQuery("");
    clearDisplayOption();
  }, [clearDisplayOption]);

  // Handle input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchInput(e.target.value);
    },
    [],
  );

  const handleClearFilters = useCallback(() => {
    setSearchInput(""); // Clear the visual input
    setAppliedSearchQuery(""); // Clear the logic
    setSelectedOption(null); // Reset dropdown
    setParams({}); // Update parent API params
    setCurrentPage(1);
    lastAppliedParams.current = JSON.stringify({});

    // Only call reset if it's passed and intended to wipe the view
    reset?.();
  }, [reset, setParams, setCurrentPage]);

  // Determine which option to display in the badge
  const displayOption = selectedOption ?? (appliedSearchQuery && defaultOption);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          {/* Search By Dropdown */}
          <Popover open={openPopover} onOpenChange={setOpenPopover}>
            <PopoverTrigger asChild>
              <Button
                role="combobox"
                variant="outline"
                aria-expanded={openPopover}
                className={cn(
                  "w-32.5 gap-2 rounded-3xl py-2 px-5 text-foreground",
                  effectiveSearchOption && "border-primary bg-cyan-50",
                  openPopover && "ring-2 ring-primary",
                )}
              >
                Search by
                <ChevronDown
                  className={cn(
                    "ml-2 h-4 w-4 opacity-50 transition-transform",
                    openPopover && "rotate-180",
                  )}
                />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-full p-0 min-w-64.25" align="start">
              <Command shouldFilter={false}>
                <CommandList
                  style={{
                    overflowY: "auto",
                    pointerEvents: "auto",
                  }}
                  onWheel={(e: React.WheelEvent) => e.stopPropagation()}
                  className="overflow-y-auto custom-scrollbar"
                >
                  <CommandGroup heading="Search by">
                    {options?.map((option) => (
                      <CommandItem
                        key={option}
                        onSelect={() => handleSelect(option)}
                        value={option}
                        className={cn(
                          "cursor-pointer",
                          effectiveSearchOption === option && "bg-accent",
                        )}
                      >
                        <span className="text-sm flex-1">{option}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {displayOption && selectedOption && (
            <Button
              variant="outline"
              onClick={handleClearSearch}
              className="h-9 text-sm text-foreground px-3"
            >
              {displayOption}
              {<X className="h-4 w-4 ml-2" />}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={
                effectiveSearchOption
                  ? `Search by ${effectiveSearchOption.toLowerCase()}`
                  : `Search ${type || ""}`
              }
              className={cn(
                "pl-9 w-70.25 h-9 rounded-md border-border",
                appliedSearchQuery && "border-primary bg-cyan-50",
              )}
              value={searchInput}
              onChange={handleInputChange}
              onKeyDown={handleSearchKeyDown}
            />
          </div>

          <Button
            size="icon"
            variant="outline"
            aria-label="Clear filters"
            onClick={handleClearFilters}
          >
            <X className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            variant="outline"
            className="h-9 w-9"
            onClick={handleSearch}
            aria-label="Search"
          >
            <SearchIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SearchInput;
