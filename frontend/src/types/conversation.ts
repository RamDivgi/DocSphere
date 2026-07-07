export interface Conversation {
    id: string;
    title: string;
    document_id: string;
    created_at: string;
}

export interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    created_at: string;
}