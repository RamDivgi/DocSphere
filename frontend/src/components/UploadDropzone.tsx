import { UploadCloud } from "lucide-react";

import { uploadDocument } from "../services/documentService";

import { useChatStore } from "../store/chatStore";
import { useDocumentStore } from "../store/documentStore";

export default function UploadDropzone() {

    const setSelectedDocument =
        useChatStore(
            (state) => state.setSelectedDocument
        );

    const addDocument =
        useDocumentStore(
            (state) => state.addDocument
        );

    async function upload(file: File) {

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

        }

    }

    function handleDrop(
        e: React.DragEvent<HTMLDivElement>
    ) {

        e.preventDefault();

        const file =
            e.dataTransfer.files?.[0];

        if (file) {

            upload(file);

        }

    }

    function handleSelect(
        e: React.ChangeEvent<HTMLInputElement>
    ) {

        const file =
            e.target.files?.[0];

        if (file) {

            upload(file);

        }

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
                />

            </label>

        </div>

    );

}