interface Props {
    role: "user" | "assistant";
    content: string;
}

export default function MessageBubble({
    role,
    content,
}: Props) {

    const isUser = role === "user";

    return (

        <div
            className={`flex ${isUser
                    ? "justify-end"
                    : "justify-start"
                }`}
        >

            <div
                className={`max-w-3xl rounded-2xl px-5 py-4 ${isUser
                        ? "bg-blue-600 text-white"
                        : "bg-[#2f2f2f] text-white"
                    }`}
            >

                {content}

            </div>

        </div>

    );

}