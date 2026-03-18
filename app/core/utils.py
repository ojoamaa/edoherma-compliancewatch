from datetime import date


def get_license_status(expiry_date: date) -> str:
    today = date.today()
    days_left = (expiry_date - today).days

    if days_left < 0:
        return "Expired"
    elif days_left <= 30:
        return "Expiring Soon"
    return "Active"