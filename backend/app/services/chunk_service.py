from langchain_text_splitters import RecursiveCharacterTextSplitter


class ChunkService:

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
    )

    @staticmethod
    def split(text: str):
        return ChunkService.splitter.split_text(text)