import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class ComplianceAlert(Base):
    __tablename__ = "compliance_alerts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    alert_type = Column(String, nullable=False)  # facility_expiry, personnel_expiry
    reference_id = Column(String, nullable=False)
    status = Column(String, default="Open")  # Open, In Progress, Resolved
    message = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
