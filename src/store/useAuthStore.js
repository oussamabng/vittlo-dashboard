import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: {
        refresh_token: "",
        access_token: "",
      },
      loginUser: (refresh_token, access_token) =>
        set(() => ({
          user: {
            refresh_token,
            access_token,
          },
        })),
      logoutUser: () =>
        set(() => ({
          user: {
            refresh_token: "",
            access_token: "",
          },
        })),
      updateToken: (access_token) =>
        set((state) => ({
          user: {
            refresh_token: state.user.refresh_token,
            access_token,
          },
        })),
    }),
    {
      name: "auth-store", // The name of the persisted state
      getStorage: () => localStorage, // The storage to use (localStorage in this case)
    }
  )
);
