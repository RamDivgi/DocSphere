import { useEffect } from "react";
import { FileText } from "lucide-react";

import { useChatStore } from "../store/chatStore";
import { useDocumentStore } from "../store/documentStore";

export default function DocumentsPanel() {

    const {
        documents,
        loadDocuments,
    } = useDocumentStore();

    const {
        selectedDocumentId,
        setSelectedDocument,
    } = useChatStore();

    useEffect(() => {
        loadDocuments();
    }, [loadDocuments]);

    return (

        <div className="p-2">

            <h2 className="mb-4 text-lg font-semibold text-white">

                Documents

            </h2>

            {documents.length === 0 ? (

                <p className="text-sm text-gray-400">

                    No PDFs uploaded

                </p>

            ) : (

                <div className="space-y-2">

                    {documents.map((doc) => (

                        <div
                            key={doc.id}
                            onClick={() =>
                                setSelectedDocument(
                                    doc.id,
                                    doc.filename
                                )
                            }
                            className={`
                                flex
                                items-center
                                gap-3
                                p-3
                                rounded-xl
                                cursor-pointer
                                transition-all
                                ${selectedDocumentId === doc.id
                                    ? "bg-blue-600"
                                    : "hover:bg-[#2f2f2f]"
                                }
                            `}
                        >

                            <FileText
                                size={20}
                            />

                            <div className="overflow-hidden">

                                <p className="truncate font-medium">

                                    {doc.filename}

                                </p>

                                <p className="text-xs text-gray-300">

                                    {doc.page_count} pages

                                </p>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>

    );

}