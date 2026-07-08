import { useState } from "react";
import { UploadCloud, FileText, Loader2, Sparkles } from "lucide-react";

import { uploadDocument } from "../services/documentService";

import { useChatStore } from "../store/chatStore";
import { useDocumentStore } from "../store/documentStore";

export default function UploadDropzone() {
    const [uploading, setUploading] = useState(false);

    const setSelectedDocument =
        useChatStore(
            (state) => state.setSelectedDocument
        );

    const addDocument =
        useDocumentStore(
            (state) => state.addDocument
        );

    async function upload(file: File) {
        setUploading(true);
        try {
            const response =
                await uploadDocument(file);

            addDocument(response.document);

            setSelectedDocument(
                response.document.id,
                response.document.filename,
            );

        } catch (err) {
            console.error(err);
            alert("Upload failed.");
        } finally {
            setUploading(false);
        }
    }

    function handleDrop(
        e: React.DragEvent<HTMLDivElement>
    ) {
        e.preventDefault();
        const file =
            e.dataTransfer.files?.[0];

        if (file && !uploading) {
            upload(file);
        }
    }

    function handleSelect(
        e: React.ChangeEvent<HTMLInputElement>
    ) {
        const file =
            e.target.files?.[0];

        if (file && !uploading) {
            upload(file);
        }
    }

    if (uploading) {
        return (
            <div className="border-2 border-dashed border-blue-500/50 bg-[#131B2E]/20 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[250px] relative overflow-hidden animate-pulse">
                {/* Background glow */}
                <div className="absolute inset-0 bg-blue-500/5 blur-[20px] rounded-2xl pointer-events-none" />
                
                {/* Animated file icon */}
                <div className="relative mb-6 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-500 relative">
                        <FileText size={32} className="animate-bounce" />
                        <div className="absolute -top-1 -right-1">
                            <Loader2 size={16} className="text-blue-400 animate-spin" />
                        </div>
                    </div>
                </div>

                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-1.5">
                    Analyzing PDF <Sparkles size={16} className="text-blue-400 animate-pulse" />
                </h2>
                
                <p className="text-slate-400 text-xs mt-2 max-w-xs leading-relaxed">
                    Uploading your document and building search indexes. This might take a few moments...
                </p>

                {/* Indeterminate progress bar */}
                <div className="w-56 h-1.5 bg-slate-800 rounded-full overflow-hidden relative mt-6">
                    <div className="absolute top-0 bottom-0 bg-gradient-to-r from-blue-500 via-indigo-400 to-blue-500 rounded-full animate-progress w-[60%] left-[-20%]"></div>
                </div>
            </div>
        );
    }

    return (
        <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="
                border-2
                border-dashed
                border-gray-600
                rounded-2xl
                p-12
                text-center
                hover:border-blue-500
                transition
            "
        >
            <UploadCloud
                size={48}
                className="mx-auto mb-5"
            />

            <h2 className="text-xl font-semibold">
                Drag & Drop PDF
            </h2>

            <p className="text-gray-400 mt-2">
                or click below
            </p>

            <label
                className="
                    mt-5
                    inline-block
                    px-6
                    py-3
                    rounded-xl
                    bg-blue-600
                    cursor-pointer
                    hover:bg-blue-700
                    transition
                "
            >
                Upload PDF
                <input
                    hidden
                    type="file"
                    accept=".pdf"
                    onChange={handleSelect}
                    disabled={uploading}
                />
            </label>
        </div>
    );
}