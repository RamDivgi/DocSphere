import api from "../lib/axios";
import type {
    LoginRequest,
    SignupRequest,
} from "../types/auth";
export const signup = async (data: SignupRequest) => {
    return api.post("/auth/signup", data);
};

export const login = async (data: LoginRequest) => {

    const form = new URLSearchParams();

    form.append("username", data.email);
    form.append("password", data.password);

    return api.post(
        "/auth/login",
        form,
        {
            headers: {
                "Content-Type":
                    "application/x-www-form-urlencoded",
            },
        }
    );
};

export const getCurrentUser = async () => {
    return api.get("/auth/me");
};