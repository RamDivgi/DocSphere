import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Sparkles, AlertCircle, MessageSquare, FileText, Search, Layers, ArrowRight } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  // Redirect to dashboard if session already exists
  useEffect(() => {
    const savedName = localStorage.getItem("session_name");
    const savedSession = localStorage.getItem("session_id");
    if (savedName && savedSession) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  function handleStart(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Please enter your name to start.");
      return;
    }

    // Save name and session ID
    localStorage.setItem("session_name", trimmedName);
    if (!localStorage.getItem("session_id")) {
      localStorage.setItem("session_id", crypto.randomUUID());
    }

    // Go to dashboard
    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen w-full bg-[#080B11] text-white flex flex-col justify-between p-6 md:p-12 relative overflow-hidden font-sans">
      {/* Dynamic ambient backgrounds */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[30%] right-[20%] w-[350px] h-[350px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Grid Layout */}
      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center my-auto z-10">
        
        {/* Left Side: Brand, Intro, and Onboarding Card */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-8 lg:pr-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-500/10 rounded-full border border-blue-500/25 text-blue-400 text-xs font-semibold tracking-wider uppercase backdrop-blur-md self-start">
              <Sparkles size={12} className="animate-spin-slow" />
              Document Intelligence Platform
            </div>
            
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
              Meet <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">DocSphere</span>
            </h1>

            <div className="h-[28px] md:h-[32px] overflow-hidden">
              <p className="text-lg md:text-xl text-slate-300 font-medium animate-typing truncate border-r-2 border-blue-500 pr-1.5 max-w-max">
                AI-Powered Document Intelligence
              </p>
            </div>

            <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-lg">
              Upload PDFs, ask intelligent questions, summarize documents and explore knowledge instantly without creating an account.
            </p>
          </div>

          {/* Glassmorphic Onboarding Form */}
          <div className="bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/50 max-w-md w-full">
            <h2 className="text-lg font-bold text-slate-200 mb-2">Welcome to DocSphere</h2>
            <p className="text-xs text-slate-400 mb-6">What should we call you?</p>

            <form onSubmit={handleStart} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError("");
                  }}
                  className={`w-full px-4 py-3.5 bg-slate-950/60 border rounded-2xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                    error ? "border-red-500/50 ring-2 ring-red-500/10" : "border-slate-800/80"
                  }`}
                  maxLength={30}
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
                className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg shadow-blue-900/15 flex items-center justify-center gap-2 group text-sm"
              >
                <span>Start Using DocSphere</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Features and Hero Illustration */}
        <div className="lg:col-span-6 flex flex-col space-y-10 lg:pl-6">
          
          {/* Vector Hero Illustration */}
          <div className="w-full flex items-center justify-center p-4 bg-slate-900/20 border border-slate-900/30 rounded-3xl backdrop-blur-md">
            <svg
              className="w-full max-w-[440px] h-auto drop-shadow-2xl"
              viewBox="0 0 500 350"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* PDF Document Base */}
              <rect x="70" y="30" width="220" height="290" rx="16" fill="#131B2E" stroke="#1E293B" strokeWidth="2" />
              <rect x="70" y="30" width="220" height="290" rx="16" fill="url(#docGlow)" fillOpacity="0.08" />
              
              {/* PDF Fold Corner */}
              <path d="M260 30L290 60H276C267.163 60 260 52.8366 260 44V30Z" fill="#1E293B" stroke="#334155" strokeWidth="1.5" />
              
              {/* Document Text Lines */}
              <line x1="100" y1="80" x2="220" y2="80" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
              <line x1="100" y1="110" x2="250" y2="110" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
              <line x1="100" y1="140" x2="190" y2="140" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
              <line x1="100" y1="170" x2="240" y2="170" stroke="#1E293B" strokeWidth="6" strokeLinecap="round" />
              <line x1="100" y1="200" x2="210" y2="200" stroke="#1E293B" strokeWidth="6" strokeLinecap="round" />
              <line x1="100" y1="230" x2="250" y2="230" stroke="#1E293B" strokeWidth="6" strokeLinecap="round" />
              
              {/* Highlight Overlay */}
              <rect x="96" y="103" width="105" height="14" rx="4" fill="#3B82F6" fillOpacity="0.15" />
              <rect x="96" y="163" width="135" height="14" rx="4" fill="#3B82F6" fillOpacity="0.15" />
              
              {/* Connected AI Node */}
              <circle cx="280" cy="200" r="35" fill="#1E1E38" stroke="#3B82F6" strokeWidth="2" />
              <circle cx="280" cy="200" r="35" fill="url(#aiNodeGlow)" />
              <Brain x="263" y="183" width="34" height="34" className="text-blue-400 animate-pulse" />
              
              {/* Connection Lines */}
              <path d="M200 110L245 200" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="4 4" />
              <path d="M230 170L245 200" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="4 4" />
              
              {/* Scanner Line */}
              <line x1="75" y1="150" x2="285" y2="150" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" className="animate-scan" />
              
              {/* Chat Bubble Left */}
              <rect x="250" y="245" width="180" height="60" rx="14" fill="#1E293B" stroke="#334155" strokeWidth="1.5" />
              <polygon points="270,305 278,315 285,305" fill="#1E293B" />
              <polygon points="270,305 278,315 285,305" stroke="#334155" strokeWidth="1.5" />
              
              <text x="270" y="270" fill="#E2E8F0" fontSize="11" fontFamily="sans-serif" fontWeight="semibold">DocSphere AI:</text>
              <text x="270" y="288" fill="#94A3B8" fontSize="10" fontFamily="sans-serif">"This PDF documents Q3 goals..."</text>

              {/* Decorative Stars */}
              <g className="animate-pulse">
                <circle cx="380" cy="60" r="2" fill="#60A5FA" />
                <circle cx="430" cy="120" r="3" fill="#818CF8" />
                <circle cx="360" cy="180" r="1.5" fill="#A78BFA" />
              </g>

              {/* Gradients */}
              <defs>
                <linearGradient id="docGlow" x1="70" y1="30" x2="290" y2="320" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#818CF8" />
                </linearGradient>
                <radialGradient id="aiNodeGlow" cx="280" cy="200" r="35" fx="280" fy="200" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#1E1E38" stopOpacity="0" />
                </radialGradient>
              </defs>
            </svg>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
            {[
              {
                icon: <MessageSquare size={18} className="text-blue-400" />,
                title: "Chat with PDFs",
                desc: "Ask questions naturally and get accurate page-referenced answers.",
              },
              {
                icon: <FileText size={18} className="text-indigo-400" />,
                title: "AI Summaries",
                desc: "Quickly extract key takeaways and outlines of huge files.",
              },
              {
                icon: <Search size={18} className="text-purple-400" />,
                title: "Semantic Search",
                desc: "Query contextually to identify themes and concepts immediately.",
              },
              {
                icon: <Layers size={18} className="text-emerald-400" />,
                title: "Multiple Chats",
                desc: "Manage and jump between different documents smoothly.",
              },
            ].map((feat, i) => (
              <div
                key={i}
                className="flex gap-3.5 p-4 rounded-2xl bg-slate-900/25 border border-slate-800/40 hover:border-slate-800 transition duration-200"
              >
                <div className="flex-shrink-0 p-2 bg-slate-950/80 border border-slate-800 rounded-xl max-h-max">
                  {feat.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">{feat.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-900/60 z-10 text-slate-500 text-xs gap-3 mt-12">
        <div>&copy; {new Date().getFullYear()} DocSphere Intelligence. All rights reserved.</div>
        <div className="flex gap-4">
          <span>Instant Access</span>
          <span>&middot;</span>
          <span>Zero Server Footprint On Logout</span>
          <span>&middot;</span>
          <span>Vector RAG Enhanced</span>
        </div>
      </footer>
    </div>
  );
}
