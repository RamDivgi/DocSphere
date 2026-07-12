
import { MessageSquare, Trash2 } from "lucide-react";
import { getMessages, deleteConversation as deleteConversationApi } from "../services/conversationService";
import { useConversationStore } from "../store/conversationStore";
import { useChatStore } from "../store/chatStore";

export default function ConversationSidebar() {
    const {
        conversations,
        selectedConversation,
        setConversations,
        setSelectedConversation,
        setMessages,
        addToast,
    } = useConversationStore();

    const { selectedDocumentId } = useChatStore();

    async function openConversation(id: string) {
        const conversation = conversations.find((c) => c.id === id);
        if (!conversation) return;

        setSelectedConversation(conversation);
        try {
            const messages = await getMessages(id);
            setMessages(messages);
        } catch (err) {
            console.error(err);
            addToast("Failed to load conversation history.", "error");
            setMessages([]);
        }
    }

    async function handleDelete(e: React.MouseEvent, id: string) {
        e.stopPropagation();
        
        if (!confirm("Are you sure you want to delete this conversation?")) {
            return;
        }

        try {
            await deleteConversationApi(id);
            addToast("Conversation deleted.", "success");
            
            const updated = conversations.filter((c) => c.id !== id);
            setConversations(updated);

            if (selectedConversation?.id === id) {
                setSelectedConversation(null);
                setMessages([]);
            }
        } catch (err) {
            console.error(err);
            addToast("Failed to delete conversation.", "error");
        }
    }

    const filteredConversations = conversations.filter(
        (c) => c.document_id === selectedDocumentId
    );

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Conversations
                </h2>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-full font-mono">
                    {filteredConversations.length}
                </span>
            </div>

            {filteredConversations.length === 0 ? (
                <p className="text-xs text-slate-500 italic px-2">
                    {selectedDocumentId 
                        ? "No conversations for this PDF yet."
                        : "Select a document to view chat history."}
                </p>
            ) : (
                <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                    {filteredConversations.map((conversation) => {
                        const isActive = selectedConversation?.id === conversation.id;
                        return (
                            <div
                                key={conversation.id}
                                onClick={() => openConversation(conversation.id)}
                                className={`
                                    group
                                    flex
                                    items-center
                                    justify-between
                                    p-2.5
                                    rounded-xl
                                    cursor-pointer
                                    transition-all
                                    duration-200
                                    text-sm
                                    ${isActive
                                        ? "bg-slate-800 text-white font-medium shadow-sm border border-slate-700/50"
                                        : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
                                    }
                                `}
                            >
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                    <MessageSquare size={16} className={`flex-shrink-0 ${isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-400"}`} />
                                    <span className="truncate pr-2">
                                        {conversation.title || "Untitled Conversation"}
                                    </span>
                                </div>
                                <button
                                    onClick={(e) => handleDelete(e, conversation.id)}
                                    className="
                                        opacity-0
                                        group-hover:opacity-100
                                        hover:bg-red-500/10
                                        p-1
                                        rounded-lg
                                        text-slate-500
                                        hover:text-red-400
                                        transition-all
                                        duration-150
                                    "
                                    title="Delete conversation"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}