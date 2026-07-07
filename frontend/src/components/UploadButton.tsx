import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { uploadDocument } from "../services/documentService";
import { useDocumentStore } from "../store/documentStore";
import { useChatStore } from "../store/chatStore";
import { useConversationStore } from "../store/conversationStore";

export default function UploadButton() {
    const [uploading, setUploading] = useState(false);
    const addDocument = useDocumentStore((state) => state.addDocument);
    const setSelectedDocument = useChatStore((state) => state.setSelectedDocument);
    const addToast = useConversationStore((state) => state.addToast);

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        addToast("Uploading PDF, please wait...", "info");

        try {
            const response = await uploadDocument(file);
            addDocument(response.document);
            setSelectedDocument(response.document.id, response.document.filename);
            addToast("PDF uploaded and selected successfully!", "success");
        } catch (err: any) {
            console.error(err);
            addToast("Upload failed. Please try again.", "error");
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    }

    return (
        <label
            className={`
                flex
                items-center
                justify-center
                gap-2
                p-3
                rounded-xl
                border
                border-slate-800
                bg-slate-900/50
                cursor-pointer
                hover:bg-slate-800
                hover:border-slate-700
                transition-all
                duration-200
                text-sm
                font-medium
                text-slate-300
                ${uploading ? "opacity-60 cursor-not-allowed pointer-events-none" : ""}
            `}
        >
            {uploading ? (
                <Loader2 size={18} className="animate-spin text-blue-500" />
            ) : (
                <Upload size={18} className="text-slate-400" />
            )}
            {uploading ? "Uploading..." : "Upload PDF"}
            <input
                type="file"
                accept=".pdf"
                hidden
                onChange={handleUpload}
                disabled={uploading}
            />
        </label>
    );
}