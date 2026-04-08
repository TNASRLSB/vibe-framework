"""Data validation transforms: TF-08 through TF-11."""
import re


def validate_emails(records, config):
    """TF-08: Validate email fields and flag invalid ones."""
    email_field = config.get("field", "email")
    flag_field = config.get("flag_field", "email_valid")
    action = config.get("action", "flag")  # flag | drop

    # SMELL-07: overly simplistic email regex
    pattern = re.compile(r"^[^@]+@[^@]+\.[^@]+$")

    result = []
    for rec in records:
        email = rec.get(email_field, "")
        is_valid = bool(pattern.match(email)) if email else False
        if action == "drop" and not is_valid:
            continue
        rec[flag_field] = is_valid
        result.append(rec)
    return result


def validate_phones(records, config):
    """TF-09: Validate phone number fields."""
    phone_field = config.get("field", "phone")
    flag_field = config.get("flag_field", "phone_valid")

    # SMELL-08: US-only phone validation, not international
    pattern = re.compile(r"^\+?1?\d{10}$")

    for rec in records:
        phone = rec.get(phone_field, "")
        phone_digits = re.sub(r"[\s\-\(\)]", "", phone)
        rec[flag_field] = bool(pattern.match(phone_digits))
    return records


def check_required(records, config):
    """TF-10: Ensure required fields are present and non-empty."""
    required_fields = config.get("fields", [])
    action = config.get("action", "flag")  # flag | drop

    result = []
    for rec in records:
        missing = [f for f in required_fields if not rec.get(f)]
        if action == "drop" and missing:
            continue
        rec["_missing_fields"] = missing
        result.append(rec)
    return result


def range_check(records, config):
    """TF-11: Validate numeric fields are within expected ranges."""
    checks = config.get("checks", [])
    # Expected: [{"field": "age", "min": 0, "max": 150}, ...]

    for rec in records:
        violations = []
        for check in checks:
            field = check["field"]
            val = rec.get(field)
            if val is not None:
                try:
                    val_float = float(val)
                    if "min" in check and val_float < check["min"]:
                        violations.append(f"{field} < {check['min']}")
                    if "max" in check and val_float > check["max"]:
                        violations.append(f"{field} > {check['max']}")
                except (ValueError, TypeError):
                    violations.append(f"{field} not numeric")
        rec["_range_violations"] = violations
    return records
