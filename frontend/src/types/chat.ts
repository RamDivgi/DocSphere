import type { Conversation } from "./conversation";

export interface ChatRequest {
    conversation_id: string | null;
    document_id: string;
    question: string;
}

export interface Citation {
    content: string;
    score: number;
}

export interface ChatResponse {
    conversation: Conversation;
    answer: string;
    citations: Citation[];
}