import { create } from 'zustand';

type UiState = {
  submissions: number;
  incrementSubmissions: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  submissions: 0,
  incrementSubmissions: () =>
    set((state) => ({
      submissions: state.submissions + 1,
    })),
}));