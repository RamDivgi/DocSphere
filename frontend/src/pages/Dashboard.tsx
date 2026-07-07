import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, ChevronLeft, ChevronRight, LogOut, Plus, Brain, AlertCircle, CheckCircle2, Info } from "lucide-react";

import { useAuthStore } from "../store/authStore";
import { useChatStore } from "../store/chatStore";
import { useConversationStore } from "../store/conversationStore";

import ConversationSidebar from "../components/ConversationSidebar";
import DocumentsPanel from "../components/DocumentsPanel";
import ChatArea from "../components/ChatArea";
import UploadButton from "../components/UploadButton";

export default function Dashboard() {
    const navigate = useNavigate();
    const logout = useAuthStore((state) => state.logout);
    const { selectedDocumentId } = useChatStore();
    const { setSelectedConversation, setMessages, toasts, removeToast, addToast } = useConversationStore();

    // Responsive layout states
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);

    function handleNewChat() {
        if (!selectedDocumentId) {
            addToast("Please select a PDF first.", "error");
            return;
        }
        setSelectedConversation(null);
        setMessages([]);
        addToast("Cleared conversation. Ready for a new chat!", "success");
        setMobileSidebarOpen(false); // Close mobile drawer if open
    }

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <div className="flex h-screen bg-[#202123] text-white overflow-hidden font-sans relative">
            
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#171717] border-b border-slate-800 w-full fixed top-0 left-0 right-0 z-20">
                <button
                    onClick={() => setMobileSidebarOpen(true)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                    <Menu size={24} />
                </button>
                <div className="flex items-center gap-1.5 font-bold text-slate-100">
                    <Brain size={20} className="text-blue-500" />
                    <span>DocSphere</span>
                </div>
                <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                    title="Logout"
                >
                    <LogOut size={18} />
                </button>
            </div>

            {/* Backdrop for Mobile Sidebar Drawer */}
            {mobileSidebarOpen && (
                <div
                    onClick={() => setMobileSidebarOpen(false)}
                    className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity"
                />
            )}

            {/* Sidebar Container (Responsive) */}
            {/* 1. Mobile Sidebar (Slide-in Drawer) */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-40 w-[300px] bg-[#171717] border-r border-slate-800/80 flex flex-col
                    transform transition-transform duration-300 ease-in-out md:hidden
                    ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
                `}
            >
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold">
                        <Brain size={22} className="text-blue-500" />
                        <span className="text-lg">DocSphere</span>
                    </div>
                    <button
                        onClick={() => setMobileSidebarOpen(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
                    <ConversationSidebar />
                    <DocumentsPanel />
                </div>

                <div className="p-4 border-t border-slate-800 space-y-3">
                    <button
                        onClick={handleNewChat}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 p-3 text-sm font-medium hover:bg-blue-700 transition"
                    >
                        <Plus size={16} /> New Chat
                    </button>
                    <UploadButton />
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </aside>

            {/* 2. Desktop & Tablet Sidebar (Collapsible) */}
            <aside
                className={`
                    hidden md:flex flex-col bg-[#171717] border-r border-slate-800/80 h-full relative z-10
                    transition-all duration-300 ease-in-out flex-shrink-0
                    ${desktopSidebarCollapsed ? "w-0 overflow-hidden border-r-0" : "w-[300px]"}
                `}
            >
                <div className="p-5 border-b border-slate-800 flex items-center gap-2">
                    <Brain size={24} className="text-blue-500 flex-shrink-0" />
                    <div>
                        <h1 className="text-lg font-bold leading-tight">DocSphere</h1>
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                            Research Assistant
                        </p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
                    <ConversationSidebar />
                    <DocumentsPanel />
                </div>

                <div className="p-4 border-t border-slate-800 space-y-2">
                    <button
                        onClick={handleNewChat}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-medium hover:bg-blue-700 shadow-lg shadow-blue-900/20 transition-all duration-150"
                    >
                        <Plus size={16} /> New Chat
                    </button>
                    <UploadButton />
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/30 py-2.5 text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all duration-150"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </aside>

            {/* Sidebar Toggle Handle for Desktop/Tablet */}
            <button
                onClick={() => setDesktopSidebarCollapsed(!desktopSidebarCollapsed)}
                className="
                    hidden md:flex
                    absolute
                    left-0
                    top-1/2
                    -translate-y-1/2
                    z-30
                    w-6
                    h-12
                    bg-[#171717]
                    hover:bg-slate-800
                    border
                    border-l-0
                    border-slate-800
                    rounded-r-xl
                    items-center
                    justify-center
                    text-slate-400
                    hover:text-white
                    shadow-md
                    transition-all
                    duration-200
                "
                style={{
                    left: desktopSidebarCollapsed ? "0" : "300px",
                    transitionProperty: "left, background-color"
                }}
                title={desktopSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                {desktopSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col h-full overflow-hidden pt-[53px] md:pt-0">
                <ChatArea />
            </main>

            {/* Toast Notifications Overlay */}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-xs md:max-w-sm w-full px-4 md:px-0 pointer-events-none">
                {toasts.map((toast) => {
                    const isSuccess = toast.type === "success";
                    const isError = toast.type === "error";
                    return (
                        <div
                            key={toast.id}
                            className={`
                                pointer-events-auto
                                flex items-start gap-3 p-4 rounded-xl shadow-lg border text-sm font-medium transition-all duration-300 animate-slide-in
                                ${isSuccess
                                    ? "bg-slate-900 border-green-500/30 text-green-400"
                                    : isError
                                    ? "bg-slate-900 border-red-500/30 text-red-400"
                                    : "bg-slate-900 border-blue-500/30 text-blue-400"
                                }
                            `}
                        >
                            {isSuccess && <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5 text-green-500" />}
                            {isError && <AlertCircle size={18} className="flex-shrink-0 mt-0.5 text-red-500" />}
                            {!isSuccess && !isError && <Info size={18} className="flex-shrink-0 mt-0.5 text-blue-500" />}
                            
                            <div className="flex-1 min-w-0 break-words leading-tight">
                                {toast.message}
                            </div>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="text-slate-400 hover:text-white flex-shrink-0 p-0.5 rounded transition"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}