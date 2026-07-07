export interface Document {
    id: string;
    filename: string;
    page_count: number;
    file_size: number;
}

export interface UploadResponse {
    success: boolean;
    document: Document;
}