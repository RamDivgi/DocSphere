from sqlalchemy.orm import Session

from app.models.document import Document


class DocumentService:

    @staticmethod
    def create_document(
        db: Session,
        user_id,
        metadata: dict,
    ):

        document = Document(
            user_id=user_id,
            filename=metadata["filename"],
            stored_filename=metadata["stored_filename"],
            file_size=metadata["file_size"],
            page_count=metadata["page_count"],
        )

        db.add(document)
        db.commit()
        db.refresh(document)

        return document

    @staticmethod
    def get_documents(
        db: Session,
        user_id,
    ):

        return (
            db.query(Document)
            .filter(Document.user_id == user_id)
            .order_by(Document.created_at.desc())
            .all()
        )

    @staticmethod
    def get_document(
        db: Session,
        document_id,
    ):

        return (
            db.query(Document)
            .filter(Document.id == document_id)
            .first()
        )

    @staticmethod
    def delete_document(
        db: Session,
        document,
    ):

        db.delete(document)
        db.commit()