import { create } from "zustand";
import { AuditLogParams } from "@/types";

type AuditLogStore = {
  params: AuditLogParams;
  currentPage: number;
  setParams: (params: Partial<AuditLogParams>) => void;
  setCurrentPage: (page: number) => void;
  reset: () => void;
};

const DEFAULT_PARAMS: AuditLogParams = { limit: 10 };

export const useAuditLogStore = create<AuditLogStore>((set) => ({
  params: DEFAULT_PARAMS,
  currentPage: 1,
  setParams: (next) =>
    set((s) => ({ params: { ...s.params, ...next }, currentPage: 1 })),
  setCurrentPage: (page) => set({ currentPage: page }),
  reset: () => set({ params: DEFAULT_PARAMS, currentPage: 1 }),
}));
