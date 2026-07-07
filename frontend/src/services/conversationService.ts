import api from "../lib/axios";
import type {
    Conversation,
    Message,
} from "../types/conversation";

export async function createConversation(
    title: string,
    document_id: string,
) {
    const res = await api.post<Conversation>(
        "/conversations/",
        {
            title,
            document_id,
        }
    );

    return res.data;
}

export async function getConversations() {
    const res = await api.get<Conversation[]>(
        "/conversations/"
    );

    return res.data;
}

export async function getMessages(
    conversationId: string,
) {
    const res = await api.get<Message[]>(
        `/conversations/${conversationId}/messages`
    );

    return res.data;
}

export async function deleteConversation(
    conversationId: string,
) {
    await api.delete(
        `/conversations/${conversationId}`
    );
}