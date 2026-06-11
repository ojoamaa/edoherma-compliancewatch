import app.models.admin
import app.models.personnel
import app.models.facility
import app.models.compliance_alert
import app.models.reminder_log

from app.core.database import Base, engine

print("Creating tables...")
Base.metadata.create_all(bind=engine)
print("Done.")