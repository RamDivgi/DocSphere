import axios from "axios";
import { useSessionStore } from "../store/sessionStore";
import { useChatStore } from "../store/chatStore";
import { useConversationStore } from "../store/conversationStore";
import { useDocumentStore } from "../store/documentStore";

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const sessionId = useSessionStore.getState().session_id;

    if (sessionId) {
        config.headers["X-Session-ID"] = sessionId;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (
            error.response &&
            (error.response.status === 401 ||
                (error.response.status === 400 &&
                    error.response.data?.detail?.includes("session")))
        ) {
            // Clear all local states
            useSessionStore.getState().clearSession();
            useChatStore.getState().clearDocument();
            useConversationStore.getState().clearConversation();
            useConversationStore.getState().setConversations([]);
            useDocumentStore.setState({ documents: [] });
            
            // Clear raw localStorage just in case
            localStorage.clear();

            if (window.location.pathname !== "/") {
                window.location.href = "/";
            }
        }

        return Promise.reject(error);
    }
);

export default api;