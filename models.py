from sqlalchemy import Column, String, Text, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from app.database import Base

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_name = Column(Text)
    email = Column(Text)
    title = Column(Text)
    category = Column(Text)
    urgency = Column(Text)
    description = Column(Text)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)