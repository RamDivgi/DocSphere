import axios from "axios";

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const sessionId = localStorage.getItem("session_id");

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
            localStorage.removeItem("session_name");
            localStorage.removeItem("session_id");

            if (window.location.pathname !== "/") {
                window.location.href = "/";
            }
        }

        return Promise.reject(error);
    }
);

export default api;