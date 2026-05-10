import { create } from "zustand";
import { Agent, QueryParams } from "@/types";

type AgentDialogs = {
  addAgent: boolean;
  deleteAgent: boolean;
  editAgent: boolean;
};

type AgentStore = {
  selectedAgent: Agent | null;
  dialogs: AgentDialogs;
  params: QueryParams;
  currentPage: number;
  setSelectedAgent: (agent: Agent | null) => void;
  toggleDialog: (key: keyof AgentDialogs, value: boolean) => void;
  setParams: (params: QueryParams) => void;
  setCurrentPage: (page: number) => void;
  reset: () => void;
};

export const useAgentStore = create<AgentStore>((set) => ({
  selectedAgent: null,
  dialogs: { addAgent: false, deleteAgent: false, editAgent: false },
  params: {},
  currentPage: 1,
  setSelectedAgent: (agent) => set({ selectedAgent: agent }),
  toggleDialog: (key, value) =>
    set((s) => ({ dialogs: { ...s.dialogs, [key]: value } })),
  setParams: (params) => set({ params }),
  setCurrentPage: (page) => set({ currentPage: page }),
  reset: () =>
    set({
      selectedAgent: null,
      dialogs: { addAgent: false, deleteAgent: false, editAgent: false },
      params: {},
      currentPage: 1,
    }),
}));
