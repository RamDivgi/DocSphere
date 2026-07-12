import api from "../lib/axios";
import { useSessionStore } from "../store/sessionStore";

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

export async function streamQuestion(
    payload: ChatRequest,
    onStage: (stage: string, message: string) => void,
    onToken: (token: string) => void,
    onDone: (data: { conversation: any; answer: string; citations: any[] }) => void,
    onError: (err: string) => void,
) {
    const sessionId = useSessionStore.getState().session_id;
    const baseURL = api.defaults.baseURL || `${import.meta.env.VITE_API_URL}/api/v1`;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (sessionId) {
        headers["X-Session-ID"] = sessionId;
    }

    try {
        const response = await fetch(`${baseURL}/chat/stream`, {
            method: "POST",
            headers,
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({ detail: response.statusText }));
            throw new Error(errData.detail || "Network response was not ok.");
        }

        if (!response.body) {
            throw new Error("ReadableStream not supported in response.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
                if (!line.trim()) continue;
                try {
                    const event = JSON.parse(line.trim());
                    if (event.stage === "error") {
                        onError(event.error);
                        return;
                    } else if (event.stage === "token") {
                        onToken(event.token);
                    } else if (event.stage === "done") {
                        onDone(event);
                        return;
                    } else if (event.stage && event.message) {
                        onStage(event.stage, event.message);
                    }
                } catch (e) {
                    console.error("Failed to parse SSE line:", line, e);
                }
            }
        }
        if (buffer.trim()) {
            try {
                const event = JSON.parse(buffer.trim());
                if (event.stage === "done") onDone(event);
                else if (event.stage === "error") onError(event.error);
            } catch {}
        }
    } catch (err: any) {
        onError(err.message || "Failed to stream response.");
    }
}