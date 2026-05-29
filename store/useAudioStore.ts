"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type AudioState = {
  isMuted: boolean;
  toggleMuted: () => void;
  setMuted: (muted: boolean) => void;
};

export const useAudioStore = create<AudioState>()(
  persist(
    (set) => ({
      isMuted: true,
      toggleMuted: () => set((state) => ({ isMuted: !state.isMuted })),
      setMuted: (muted) => set({ isMuted: muted }),
    }),
    {
      name: "velmere-audio-preference-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);
