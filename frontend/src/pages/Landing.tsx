import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Sparkles, AlertCircle } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  // Redirect to dashboard if session already exists
  useEffect(() => {
    const savedName = localStorage.getItem("name");
    const savedSession = localStorage.getItem("session_id");
    if (savedName && savedSession) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  function handleStart(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Please enter your name to proceed.");
      return;
    }

    // Save name and session ID
    localStorage.setItem("name", trimmedName);
    if (!localStorage.getItem("session_id")) {
      localStorage.setItem("session_id", crypto.randomUUID());
    }

    // Go to dashboard
    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen w-full bg-[#0B0F19] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Decorative background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Header section with Logo & Slogan */}
      <div className="text-center mb-10 z-10 max-w-lg animate-fade-in-down">
        <div className="inline-flex p-3.5 bg-blue-600/10 rounded-2xl border border-blue-500/20 text-blue-400 mb-5 shadow-lg shadow-blue-950/20 backdrop-blur-md">
          <Brain size={42} className="animate-pulse" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          DocSphere
        </h1>
        <p className="text-md md:text-lg text-slate-300 font-semibold mt-3 flex items-center justify-center gap-1.5">
          <Sparkles size={16} className="text-blue-400" />
          Your AI-Powered Document Intelligence Assistant
        </p>
        <p className="text-xs md:text-sm text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
          Upload PDFs, ask questions, generate summaries, and explore your documents using AI.
        </p>
      </div>

      {/* Glassmorphic Onboarding Card */}
      <div className="w-full max-w-md bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-2xl shadow-black/40 z-10 animate-fade-in">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-100">Welcome</h2>
          <p className="text-slate-400 text-sm mt-1.5">Before we begin, tell us your name.</p>
        </div>

        <form onSubmit={handleStart} className="space-y-5">
          <div>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              className={`w-full px-4 py-3.5 bg-slate-950/50 border rounded-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                error ? "border-red-500/50 ring-2 ring-red-500/20" : "border-slate-800"
              }`}
              maxLength={40}
              autoFocus
            />
            {error && (
              <div className="flex items-center gap-1.5 text-xs text-red-400 mt-2 ml-1 animate-slide-in">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg shadow-blue-900/20 hover:shadow-blue-800/30 flex items-center justify-center gap-2"
          >
            Start Using DocSphere
          </button>
        </form>
      </div>

      <div className="absolute bottom-6 text-slate-600 text-xs tracking-wide select-none">
        Secure &middot; Privacy First &middot; Instant Access
      </div>
    </div>
  );
}
