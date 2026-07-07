import { create } from "zustand";
import type { User } from "../types/auth";

interface AuthStore {

    user: User | null;

    token: string | null;

    isAuthenticated: boolean;

    isLoading: boolean;

    setUser: (user: User | null) => void;

    setToken: (token: string | null) => void;

    logout: () => void;
}

export const useAuthStore =
    create<AuthStore>((set) => ({

        user: null,

        token: localStorage.getItem("token"),

        isAuthenticated:
            !!localStorage.getItem("token"),

        isLoading: false,

        setUser: (user) =>
            set({
                user,
                isAuthenticated: !!user,
            }),

        setToken: (token) => {

            if (token) {
                localStorage.setItem(
                    "token",
                    token
                );
            } else {
                localStorage.removeItem(
                    "token"
                );
            }

            set({ token });
        },

        logout: () => {

            localStorage.removeItem("token");

            set({
                user: null,
                token: null,
                isAuthenticated: false,
            });
        },

    }));