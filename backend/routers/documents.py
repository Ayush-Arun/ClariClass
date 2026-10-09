import os
import shutil
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import Document, Chunk
from services.document_parser import parse_document

router = APIRouter(prefix="/documents", tags=["Documents"])

UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(None),
    db: Session = Depends(get_db)
):
    """
    Uploads a PDF or PPTX file, persists it, and parses into ordered content chunks.
    """
    file_ext = file.filename.split(".")[-1].lower()
    if file_ext not in ["pdf", "pptx", "ppt"]:
        raise HTTPException(status_code=400, detail="Only PDF and PPTX files are supported.")

    doc_title = title or file.filename
    file_path = os.path.join(UPLOAD_DIR, f"{int(os.times().elapsed)}_{file.filename}")

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    document = Document(
        title=doc_title,
        file_path=file_path,
        file_type=file_ext
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    # Parse into chunks
    parsed_chunks = parse_document(file_path, file_ext)
    for c in parsed_chunks:
        chunk = Chunk(
            document_id=document.id,
            chunk_order=c["order"],
            original_text=c["text"],
            page_number=c.get("page_number", 1)
        )
        db.add(chunk)

    db.commit()

    return {
        "document_id": document.id,
        "title": document.title,
        "chunks_count": len(parsed_chunks)
    }

@router.get("")
def list_documents(db: Session = Depends(get_db)):
    """
    Returns all uploaded documents with chunk counts.
    """
    docs = db.query(Document).order_by(Document.created_at.desc()).all()
    results = []
    for d in docs:
        count = db.query(Chunk).filter(Chunk.document_id == d.id).count()
        results.append({
            "id": d.id,
            "title": d.title,
            "file_type": d.file_type,
            "chunks_count": count,
            "created_at": d.created_at
        })
    return results

@router.get("/{document_id}")
def get_document(document_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    
    chunks = db.query(Chunk).filter(Chunk.document_id == document_id).order_by(Chunk.chunk_order).all()
    return {
        "id": doc.id,
        "title": doc.title,
        "file_type": doc.file_type,
        "created_at": doc.created_at,
        "chunks": [
            {
                "id": c.id,
                "order": c.chunk_order,
                "title": c.original_text.split('\n')[0][:50] if '\n' in c.original_text else f"Slide {c.page_number}",
                "text": c.original_text,
                "simplified_text": c.simplified_text,
                "page_number": c.page_number
            }
            for c in chunks
        ]
    }
