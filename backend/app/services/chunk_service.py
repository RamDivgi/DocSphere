from langchain_text_splitters import RecursiveCharacterTextSplitter


class ChunkService:

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=150,
        separators=["\n\n", "\n", ". ", " ", ""],
    )

    @staticmethod
    def split(text: str):
        if not text:
            return []
        return ChunkService.splitter.split_text(text)