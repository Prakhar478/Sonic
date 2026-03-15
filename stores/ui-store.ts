import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIStore {
  sidebarOpen: boolean;
  isMobile: boolean;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setMobile: (isMobile: boolean) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      isMobile: false,

      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setMobile: (isMobile) => set({ isMobile, sidebarOpen: !isMobile }),
    }),
    {
      name: 'sonic-ui',
      // We no longer need to persist theme as it's always dark
      partialize: (state) => ({ sidebarOpen: state.sidebarOpen }),
    }
  )
);
