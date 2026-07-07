import { useEffect, useState, useRef } from "react";
import { Brain, SendHorizontal, Sparkles, User, FileText } from "lucide-react";
import UploadDropzone from "./UploadDropzone";
import { askQuestion } from "../services/chatService";
import { getMessages } from "../services/conversationService";
import { useChatStore } from "../store/chatStore";
import { useConversationStore } from "../store/conversationStore";

export default function ChatArea() {
    const {
        selectedDocumentId,
        selectedDocumentName,
    } = useChatStore();

    const {
        selectedConversation,
        messages,
        loading,
        setMessages,
        addMessage,
        addConversation,
        setSelectedConversation,
        setLoading,
        addToast,
    } = useConversationStore();

    const [question, setQuestion] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    // Load messages whenever selected conversation changes
    useEffect(() => {
        async function loadMessages() {
            if (!selectedConversation) {
                setMessages([]);
                return;
            }

            try {
                const data = await getMessages(selectedConversation.id);
                setMessages(data);
            } catch (err) {
                console.error(err);
                addToast("Failed to load message history.", "error");
                setMessages([]);
            }
        }

        loadMessages();
    }, [selectedConversation, setMessages, addToast]);

    async function send() {
        if (!question.trim()) return;

        if (!selectedDocumentId) {
            addToast("Please select a PDF first.", "error");
            return;
        }

        const userQuestion = question.trim();
        setQuestion("");

        // 1. Add user message locally for instant feedback
        const tempUserMessage = {
            id: crypto.randomUUID(),
            role: "user" as const,
            content: userQuestion,
            created_at: new Date().toISOString(),
        };
        addMessage(tempUserMessage);

        setLoading(true);

        try {
            // 2. Call backend chat API
            const response = await askQuestion({
                conversation_id: selectedConversation ? selectedConversation.id : null,
                document_id: selectedDocumentId,
                question: userQuestion,
            });

            // 3. If it was the first message, a new conversation was created
            if (!selectedConversation) {
                addConversation(response.conversation);
                setSelectedConversation(response.conversation);
                addToast("New conversation started!", "success");
            } else {
                // For existing conversations, fetch the full history to keep it synced
                const data = await getMessages(selectedConversation.id);
                setMessages(data);
            }
        } catch (err: any) {
            console.error(err);
            
            // Check for authentication error
            if (err?.response?.status === 401) {
                addToast("Session expired. Please log in again.", "error");
            } else {
                addToast("Failed to get response from AI.", "error");
            }

            addMessage({
                id: crypto.randomUUID(),
                role: "assistant",
                content: "Error: Failed to fetch AI answer. Check your connection or authentication.",
                created_at: new Date().toISOString(),
            });
        } finally {
            setLoading(false);
        }
    }

    function formatTime(isoString?: string) {
        if (!isoString) return "";
        try {
            const date = new Date(isoString);
            return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        } catch {
            return "";
        }
    }

    // Markdown Parser
    function parseInlineMarkdown(text: string) {
        const regex = /(\*\*.*?\*\*|`.*?`|\*.*?\*)/g;
        const parts = text.split(regex);
        return parts.map((part, idx) => {
            if (part.startsWith("**") && part.endsWith("**")) {
                return <strong key={idx} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith("`") && part.endsWith("`")) {
                return <code key={idx} className="bg-slate-800 text-amber-400 px-1.5 py-0.5 rounded font-mono text-xs border border-slate-700">{part.slice(1, -1)}</code>;
            }
            if (part.startsWith("*") && part.endsWith("*")) {
                return <em key={idx} className="italic text-slate-200">{part.slice(1, -1)}</em>;
            }
            return part;
        });
    }

    function renderMarkdown(text: string) {
        if (!text) return null;
        const parts = text.split(/(```[\s\S]*?```)/g);

        return parts.map((part, index) => {
            if (part.startsWith("```") && part.endsWith("```")) {
                const codeContent = part.slice(3, -3);
                const lines = codeContent.split("\n");
                let language = "code";
                let code = codeContent;
                if (lines[0] && lines[0].trim().length < 15 && !lines[0].includes(" ") && !lines[0].includes(":") && !lines[0].includes(";")) {
                    language = lines[0].trim();
                    code = lines.slice(1).join("\n");
                }
                return (
                    <pre key={index} className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-slate-200 overflow-x-auto my-4 font-mono text-xs leading-relaxed select-all">
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 select-none border-b border-slate-800 pb-1.5 flex justify-between items-center">
                            <span>{language}</span>
                            <span className="text-[9px] font-normal lowercase text-slate-600">copy-click ready</span>
                        </div>
                        <code>{code.trim()}</code>
                    </pre>
                );
            }

            const lines = part.split("\n");
            return (
                <div key={index} className="space-y-3">
                    {lines.map((line, lIdx) => {
                        if (line.startsWith("### ")) {
                            return <h4 key={lIdx} className="text-base font-bold text-white mt-4 mb-2">{parseInlineMarkdown(line.slice(4))}</h4>;
                        }
                        if (line.startsWith("## ")) {
                            return <h3 key={lIdx} className="text-lg font-bold text-white mt-5 mb-3 border-b border-slate-800 pb-1">{parseInlineMarkdown(line.slice(3))}</h3>;
                        }
                        if (line.startsWith("# ")) {
                            return <h2 key={lIdx} className="text-xl font-bold text-white mt-6 mb-4">{parseInlineMarkdown(line.slice(2))}</h2>;
                        }
                        if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
                            const content = line.trim().slice(2);
                            return (
                                <ul key={lIdx} className="list-disc list-inside pl-4 text-slate-300 space-y-1">
                                    <li className="text-sm">{parseInlineMarkdown(content)}</li>
                                </ul>
                            );
                        }
                        if (line.trim() === "") {
                            return <div key={lIdx} className="h-1.5"></div>;
                        }
                        return <p key={lIdx} className="text-sm text-slate-300 leading-relaxed">{parseInlineMarkdown(line)}</p>;
                    })}
                </div>
            );
        });
    }

    if (!selectedDocumentId) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#202123] h-full overflow-y-auto">
                <div className="max-w-md w-full">
                    <UploadDropzone />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#202123] text-slate-200">
            {/* Header */}
            <header className="border-b border-slate-800/80 bg-[#171717]/85 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3 min-w-0">
                    <FileText className="text-blue-500 flex-shrink-0" size={20} />
                    <div className="min-w-0">
                        <h2 className="font-semibold text-slate-200 text-sm truncate">
                            {selectedConversation?.title ?? "New Conversation"}
                        </h2>
                        <p className="text-[11px] text-slate-400 truncate">
                            Source: {selectedDocumentName}
                        </p>
                    </div>
                </div>
            </header>

            {/* Chat History / Messages list */}
            <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                {messages.length === 0 && !loading && (
                    <div className="flex-grow flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 mb-4 border border-blue-500/20">
                            <Brain size={28} className="animate-pulse" />
                        </div>
                        <h3 className="text-base font-semibold text-slate-200 mb-1">
                            Analyze: {selectedDocumentName}
                        </h3>
                        <p className="text-slate-400 text-xs max-w-sm px-6">
                            Start asking questions about this PDF. The chat will be saved to your sidebar on the first send.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-2 justify-center max-w-md px-4">
                            {[
                                "Give me a summary of this document",
                                "What are the main findings or key topics?",
                                "Explain the major concepts step-by-step",
                            ].map((suggestion, i) => (
                                <button
                                    key={i}
                                    onClick={() => setQuestion(suggestion)}
                                    className="text-xs bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200 px-3 py-2 rounded-xl transition duration-150"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((message) => {
                    const isUser = message.role === "user";
                    return (
                        <div
                            key={message.id}
                            className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"}`}
                        >
                            {/* Avatar */}
                            {!isUser && (
                                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white flex-shrink-0 border border-blue-500 shadow-lg shadow-blue-900/25">
                                    <Sparkles size={14} />
                                </div>
                            )}

                            {/* Bubble */}
                            <div className="max-w-[85%] md:max-w-2xl flex flex-col space-y-1">
                                <div
                                    className={`
                                        rounded-2xl px-4 py-3 shadow-md border
                                        ${isUser
                                            ? "bg-blue-600 text-white border-blue-500 shadow-blue-950/20"
                                            : "bg-[#2f2f2f] text-slate-200 border-slate-700/50 shadow-black/10"
                                        }
                                    `}
                                >
                                    {isUser ? (
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                    ) : (
                                        <div className="markdown-body">
                                            {renderMarkdown(message.content)}
                                        </div>
                                    )}
                                </div>
                                <span className={`text-[10px] text-slate-500 ${isUser ? "self-end" : "self-start"}`}>
                                    {formatTime(message.created_at)}
                                </span>
                            </div>

                            {isUser && (
                                <div className="w-8 h-8 rounded-xl bg-slate-700 flex items-center justify-center text-slate-200 flex-shrink-0 border border-slate-600">
                                    <User size={14} />
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Animated Typing / Loading Indicator */}
                {loading && (
                    <div className="flex gap-4 justify-start">
                        <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white flex-shrink-0 border border-blue-500 animate-pulse">
                            <Sparkles size={14} />
                        </div>
                        <div className="bg-[#2f2f2f] rounded-2xl px-4 py-3 border border-slate-700/50 shadow-md">
                            <div className="flex gap-1.5 items-center py-1 px-0.5">
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="border-t border-slate-800/80 bg-[#171717]/70 backdrop-blur-md p-4 sticky bottom-0">
                <div className="max-w-3xl mx-auto flex gap-3 relative">
                    <input
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                send();
                            }
                        }}
                        disabled={loading}
                        placeholder="Ask a question about the document..."
                        className="
                            flex-1
                            rounded-xl
                            bg-slate-900
                            border
                            border-slate-800
                            hover:border-slate-700
                            focus:border-blue-500
                            focus:ring-1
                            focus:ring-blue-500
                            p-4
                            pr-12
                            outline-none
                            text-sm
                            text-slate-100
                            placeholder-slate-500
                            transition-all
                            disabled:opacity-50
                        "
                    />
                    <button
                        onClick={send}
                        disabled={loading || !question.trim()}
                        className="
                            absolute
                            right-3
                            top-1/2
                            -translate-y-1/2
                            p-2
                            rounded-lg
                            bg-white
                            hover:bg-slate-100
                            disabled:bg-slate-800
                            disabled:text-slate-600
                            text-black
                            transition-all
                            duration-150
                        "
                    >
                        <SendHorizontal size={16} />
                    </button>
                </div>
                <div className="max-w-3xl mx-auto text-center mt-2">
                    <span className="text-[10px] text-slate-500">
                        DocSphere can retrieve and analyze context within the loaded PDF.
                    </span>
                </div>
            </div>
        </div>
    );
}