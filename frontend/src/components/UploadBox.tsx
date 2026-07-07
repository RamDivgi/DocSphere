import { Upload } from "lucide-react";

interface Props {
    onSelect: (file: File) => void;
}

export default function UploadBox({
    onSelect,
}: Props) {

    return (

        <label
            className="
            border-2
            border-dashed
            rounded-2xl
            p-16
            flex
            flex-col
            items-center
            justify-center
            cursor-pointer
            hover:border-violet-500
            transition
            "
        >

            <Upload size={60} />

            <h2 className="mt-4 text-xl font-semibold">
                Upload PDF
            </h2>

            <p className="text-gray-500">
                Drag & Drop or Browse
            </p>

            <input
                hidden
                type="file"
                accept=".pdf"
                onChange={(e) => {

                    if (!e.target.files) return;

                    onSelect(
                        e.target.files[0]
                    );

                }}
            />

        </label>

    );
}