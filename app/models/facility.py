import uuid
from datetime import datetime

from sqlalchemy import Column, String, Date, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class Facility(Base):
    __tablename__ = "facilities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    facility_name = Column(String, nullable=False, index=True)
    facility_type = Column(String, nullable=False)
    lga = Column(String, nullable=False, index=True)
    address = Column(String, nullable=True)
    license_number = Column(String, unique=True, nullable=False)
    license_issue_date = Column(Date, nullable=False)
    license_expiry_date = Column(Date, nullable=False)
    status = Column(String, default="Active")
    created_at = Column(DateTime, default=datetime.utcnow)

    personnel = relationship("Personnel", back_populates="facility")