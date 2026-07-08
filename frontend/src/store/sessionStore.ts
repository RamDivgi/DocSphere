import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SessionStore {
    session_id: string | null;
    session_name: string | null;
    setSession: (id: string, name: string) => void;
    clearSession: () => void;
}

export const useSessionStore = create<SessionStore>()(
    persist(
        (set) => ({
            session_id: null,
            session_name: null,
            setSession: (id, name) =>
                set({
                    session_id: id,
                    session_name: name,
                }),
            clearSession: () =>
                set({
                    session_id: null,
                    session_name: null,
                }),
        }),
        {
            name: "session-store",
        }
    )
);
