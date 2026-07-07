import { create } from "zustand";

import { getDocuments } from "../services/documentService";

import type { Document } from "../types/document";

interface DocumentStore {

    documents: Document[];

    loading: boolean;

    loadDocuments: () => Promise<void>;

    addDocument: (doc: Document) => void;

}

export const useDocumentStore =
    create<DocumentStore>((set) => ({

        documents: [],

        loading: false,

        loadDocuments: async () => {

            set({
                loading: true,
            });

            try {

                const docs =
                    await getDocuments();

                set({
                    documents: docs,
                    loading: false,
                });

            } catch (err) {

                console.error(err);

                set({
                    loading: false,
                });

            }

        },

        addDocument: (doc) =>

            set((state) => ({

                documents: [
                    doc,
                    ...state.documents,
                ],

            })),

    }));