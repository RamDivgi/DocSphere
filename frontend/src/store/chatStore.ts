import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ChatStore {
    selectedDocumentId: string | null;
    selectedDocumentName: string | null;
    setSelectedDocument: (id: string, name: string) => void;
    clearDocument: () => void;
}

export const useChatStore = create<ChatStore>()(
    persist(
        (set) => ({
            selectedDocumentId: null,
            selectedDocumentName: null,
            setSelectedDocument: (id, name) =>
                set({
                    selectedDocumentId: id,
                    selectedDocumentName: name,
                }),
            clearDocument: () =>
                set({
                    selectedDocumentId: null,
                    selectedDocumentName: null,
                }),
        }),
        {
            name: "chat-store",
        }
    )
);