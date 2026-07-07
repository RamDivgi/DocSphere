import api from "../lib/axios";
import type { Document, UploadResponse } from "../types/document";

export async function uploadDocument(
    file: File
): Promise<UploadResponse> {

    const formData = new FormData();

    formData.append("file", file);

    const response = await api.post<UploadResponse>(
        "/documents/upload",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data;
}

export async function getDocuments(): Promise<Document[]> {

    const response = await api.get<{
        documents: Document[];
    }>("/documents/");

    return response.data.documents;
}