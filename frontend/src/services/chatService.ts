import api from "../lib/axios";

import type {
    ChatRequest,
    ChatResponse,
} from "../types/chat";

export async function askQuestion(
    payload: ChatRequest,
): Promise<ChatResponse> {

    const response =
        await api.post<ChatResponse>(
            "/chat/",
            payload,
        );

    return response.data;

}