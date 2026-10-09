from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Float, Boolean
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=True)
    role = Column(String(50), default="teacher")  # teacher | student | admin
    otp_code = Column(String(10), nullable=True)
    otp_created_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)  # pdf | pptx
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    chunks = relationship("Chunk", back_populates="document", cascade="all, delete-orphan")
    sessions = relationship("ClassSession", back_populates="document")

class Chunk(Base):
    __tablename__ = "chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    chunk_order = Column(Integer, nullable=False)
    original_text = Column(Text, nullable=False)
    simplified_text = Column(Text, nullable=True)
    simplified_at = Column(DateTime, nullable=True)
    page_number = Column(Integer, default=1)

    document = relationship("Document", back_populates="chunks")
    signals = relationship("Signal", back_populates="chunk", cascade="all, delete-orphan")

class ClassSession(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    room_code = Column(String(20), unique=True, index=True, nullable=False)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    struggle_threshold_percent = Column(Float, default=25.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="sessions")
    students = relationship("Student", back_populates="session", cascade="all, delete-orphan")

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=False)
    display_name = Column(String(255), nullable=False)
    socket_id = Column(String(100), nullable=True)
    is_calibrated = Column(Boolean, default=False)
    joined_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("ClassSession", back_populates="students")
    signals = relationship("Signal", back_populates="student", cascade="all, delete-orphan")

class Signal(Base):
    __tablename__ = "signals"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    chunk_id = Column(Integer, ForeignKey("chunks.id"), nullable=False)
    signal_type = Column(String(50), nullable=False) # flag_difficult | flag_important | dwell_ms | gaze_dwell_ms | expression_confusion
    value = Column(Float, default=1.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="signals")
    chunk = relationship("Chunk", back_populates="signals")
