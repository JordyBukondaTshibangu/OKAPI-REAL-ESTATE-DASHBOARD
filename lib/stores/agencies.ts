import { create } from "zustand";
import { Agency, QueryParams } from "@/types";

type AgencyDialogs = {
  addAgency: boolean;
  deleteAgency: boolean;
  editAgency: boolean;
};

type AgencyStore = {
  selectedAgency: Agency | null;
  dialogs: AgencyDialogs;
  params: QueryParams;
  currentPage: number;
  setSelectedAgency: (agency: Agency | null) => void;
  toggleDialog: (key: keyof AgencyDialogs, value: boolean) => void;
  setParams: (params: QueryParams) => void;
  setCurrentPage: (page: number) => void;
  reset: () => void;
};

export const useAgencyStore = create<AgencyStore>((set) => ({
  selectedAgency: null,
  dialogs: { addAgency: false, deleteAgency: false, editAgency: false },
  params: {},
  currentPage: 1,
  setSelectedAgency: (agency) => set({ selectedAgency: agency }),
  toggleDialog: (key, value) =>
    set((s) => ({ dialogs: { ...s.dialogs, [key]: value } })),
  setParams: (params) => set({ params }),
  setCurrentPage: (page) => set({ currentPage: page }),
  reset: () =>
    set({
      selectedAgency: null,
      dialogs: { addAgency: false, deleteAgency: false, editAgency: false },
      params: {},
      currentPage: 1,
    }),
}));
