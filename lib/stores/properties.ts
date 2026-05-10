import { create } from "zustand";
import { Property, QueryParams } from "@/types";

type PropertyDialogs = {
  addProperty: boolean;
  deleteProperty: boolean;
  editProperty: boolean;
};

type PropertyStore = {
  selectedProperty: Property | null;
  dialogs: PropertyDialogs;
  params: QueryParams;
  currentPage: number;
  setSelectedProperty: (property: Property | null) => void;
  toggleDialog: (key: keyof PropertyDialogs, value: boolean) => void;
  setParams: (params: QueryParams) => void;
  setCurrentPage: (page: number) => void;
  reset: () => void;
};

export const usePropertyStore = create<PropertyStore>((set) => ({
  selectedProperty: null,
  dialogs: { addProperty: false, deleteProperty: false, editProperty: false },
  params: {},
  currentPage: 1,
  setSelectedProperty: (property) => set({ selectedProperty: property }),
  toggleDialog: (key, value) =>
    set((s) => ({ dialogs: { ...s.dialogs, [key]: value } })),
  setParams: (params) => set({ params }),
  setCurrentPage: (page) => set({ currentPage: page }),
  reset: () =>
    set({
      selectedProperty: null,
      dialogs: { addProperty: false, deleteProperty: false, editProperty: false },
      params: {},
      currentPage: 1,
    }),
}));
