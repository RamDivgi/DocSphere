import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, KeyRound, Eye, EyeOff } from "lucide-react";
import { login, getCurrentUser } from "../services/authService";
import { useAuthStore } from "../store/authStore";

export default function Login() {
    const navigate = useNavigate();

    const setToken = useAuthStore((s) => s.setToken);
    const setUser = useAuthStore((s) => s.setUser);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (loading) return;

        setError("");
        setLoading(true);

        try {
            const res = await login({
                email,
                password,
            });

            setToken(res.data.access_token);

            const user = await getCurrentUser();
            setUser(user.data);

            navigate("/dashboard");
        } catch (err: any) {
            setPassword(""); // Clear only the password field after failed login
            
            if (err?.response?.status === 401) {
                setError("Invalid email or password");
            } else {
                let errorMsg = "Login failed. Please verify your connection.";
                if (err?.response?.data?.detail) {
                    if (typeof err.response.data.detail === "string") {
                        errorMsg = err.response.data.detail;
                    } else if (Array.isArray(err.response.data.detail)) {
                        errorMsg = err.response.data.detail.map((d: any) => d.msg).join(", ");
                    }
                }
                setError(errorMsg);
            }
        } finally {
            setLoading(false);
        }
    }

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (error) setError("");
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        if (error) setError("");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0d0e12] text-slate-200 p-4">
            <div className="w-full max-w-md bg-[#16171e] p-8 rounded-2xl border border-slate-800/80 shadow-2xl">
                <div className="flex flex-col items-center justify-center mb-6">
                    <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 mb-3 border border-blue-500/20">
                        <KeyRound size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
                    <p className="text-slate-400 text-xs mt-1">Sign in to your DocSphere account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            disabled={loading}
                            className="
                                w-full
                                rounded-xl
                                bg-slate-900/50
                                border
                                border-slate-800
                                hover:border-slate-700
                                focus:border-blue-500
                                focus:ring-1
                                focus:ring-blue-500
                                p-3.5
                                outline-none
                                text-sm
                                text-slate-100
                                placeholder-slate-500
                                transition
                                disabled:opacity-50
                            "
                            placeholder="name@example.com"
                            value={email}
                            onChange={handleEmailChange}
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                required
                                disabled={loading}
                                className="
                                    w-full
                                    rounded-xl
                                    bg-slate-900/50
                                    border
                                    border-slate-800
                                    hover:border-slate-700
                                    focus:border-blue-500
                                    focus:ring-1
                                    focus:ring-blue-500
                                    p-3.5
                                    pr-11
                                    outline-none
                                    text-sm
                                    text-slate-100
                                    placeholder-slate-500
                                    transition
                                    disabled:opacity-50
                                "
                                placeholder="••••••••"
                                value={password}
                                onChange={handlePasswordChange}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-400">
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="
                            w-full
                            flex
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            bg-blue-600
                            p-3.5
                            text-sm
                            font-semibold
                            text-white
                            hover:bg-blue-700
                            transition-all
                            duration-150
                            shadow-lg
                            shadow-blue-900/20
                            disabled:opacity-60
                            disabled:cursor-not-allowed
                            cursor-pointer
                        "
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>Signing in...</span>
                            </>
                        ) : (
                            <span>Sign In</span>
                        )}
                    </button>

                    <div className="text-center pt-2">
                        <span className="text-xs text-slate-500">Don't have an account? </span>
                        <Link
                            to="/signup"
                            className="text-xs text-blue-400 hover:text-blue-300 font-medium hover:underline"
                        >
                            Create account
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}