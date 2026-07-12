import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Conversation, Message } from "../types/conversation";

export interface Toast {
    id: string;
    message: string;
    type: "success" | "error" | "info";
}

interface ConversationStore {
    conversations: Conversation[];
    selectedConversation: Conversation | null;
    messages: Message[];
    loading: boolean;
    toasts: Toast[];

    setConversations: (conversations: Conversation[]) => void;
    loadConversations: () => Promise<void>;
    addConversation: (conversation: Conversation) => void;
    updateConversation: (id: string, updates: Partial<Conversation>) => void;
    setSelectedConversation: (conversation: Conversation | null) => void;
    setMessages: (messages: Message[]) => void;
    addMessage: (message: Message) => void;
    clearConversation: () => void;
    setLoading: (loading: boolean) => void;
    addToast: (message: string, type: "success" | "error" | "info") => void;
    removeToast: (id: string) => void;
}

export const useConversationStore = create<ConversationStore>()(
    persist(
        (set, get) => ({
            conversations: [],
            selectedConversation: null,
            messages: [],
            loading: false,
            toasts: [],

            setConversations: (conversations) => set({ conversations }),

            loadConversations: async () => {
                set({ loading: true });
                try {
                    const { getConversations } = await import("../services/conversationService");
                    const data = await getConversations();
                    set({ conversations: data, loading: false });

                    // Self-correct stale selected conversation selection on initial load
                    const activeConv = get().selectedConversation;
                    if (activeConv) {
                        const exists = data.some((c) => c.id === activeConv.id);
                        if (!exists) {
                            set({ selectedConversation: null, messages: [] });
                        }
                    }
                } catch (err) {
                    console.error("Failed to load conversations:", err);
                    set({ loading: false });
                }
            },

            addConversation: (conversation) =>
                set((state) => ({
                    conversations: [conversation, ...state.conversations],
                })),

            updateConversation: (id, updates) =>
                set((state) => ({
                    conversations: state.conversations.map((c) =>
                        c.id === id ? { ...c, ...updates } : c
                    ),
                    selectedConversation:
                        state.selectedConversation?.id === id
                            ? { ...state.selectedConversation, ...updates }
                            : state.selectedConversation,
                })),

            setSelectedConversation: (conversation) => set({ selectedConversation: conversation }),

            setMessages: (messages) => set({ messages }),

            addMessage: (message) =>
                set((state) => ({
                    messages: [...state.messages, message],
                })),

            clearConversation: () =>
                set({
                    selectedConversation: null,
                    messages: [],
                }),

            setLoading: (loading) => set({ loading }),

            addToast: (message, type) => {
                const id = crypto.randomUUID();
                set((state) => ({
                    toasts: [...state.toasts, { id, message, type }],
                }));
                setTimeout(() => {
                    set((state) => ({
                        toasts: state.toasts.filter((t) => t.id !== id),
                    }));
                }, 4000);
            },

            removeToast: (id) =>
                set((state) => ({
                    toasts: state.toasts.filter((t) => t.id !== id),
                })),
        }),
        {
            name: "conversation-store",
            partialize: (state) => ({
                selectedConversation: state.selectedConversation,
            }),
        }
    )
);