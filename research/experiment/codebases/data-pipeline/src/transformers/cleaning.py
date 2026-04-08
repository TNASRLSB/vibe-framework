"""Data cleaning transforms: TF-01 through TF-04."""
from datetime import datetime


def clean_nulls(records, config):
    """TF-01: Replace null/empty values with defaults."""
    defaults = config.get("defaults", {})
    strategy = config.get("strategy", "default")  # default | drop | skip
    result = []
    for rec in records:
        if strategy == "drop":
            if all(v is not None and v != "" for v in rec.values()):
                result.append(rec)
        else:
            cleaned = {}
            for k, v in rec.items():
                if v is None or v == "":
                    cleaned[k] = defaults.get(k, None)
                else:
                    cleaned[k] = v
            result.append(cleaned)
    return result


def normalize_dates(records, config):
    """TF-02: Parse and normalize date fields to ISO format."""
    date_fields = config.get("fields", [])
    input_formats = config.get("input_formats", ["%Y-%m-%d", "%m/%d/%Y", "%d-%m-%Y"])
    output_format = config.get("output_format", "%Y-%m-%d")
    for rec in records:
        for field in date_fields:
            val = rec.get(field)
            if val:
                for fmt in input_formats:
                    try:
                        parsed = datetime.strptime(val, fmt)
                        rec[field] = parsed.strftime(output_format)
                        break
                    except ValueError:
                        continue
                # SMELL-02: silently leaves unparseable dates unchanged
    return records


def trim_strings(records, config):
    """TF-03: Strip whitespace from all string fields."""
    fields = config.get("fields", None)  # None = all fields
    for rec in records:
        for k, v in rec.items():
            if isinstance(v, str) and (fields is None or k in fields):
                rec[k] = v.strip()
    return records


def deduplicate(records, config):
    """TF-04: Remove duplicate records."""
    key_fields = config.get("key_fields", None)
    seen = set()
    result = []
    for rec in records:
        if key_fields:
            key = tuple(rec.get(f) for f in key_fields)
        else:
            # SMELL-03: dict is not hashable, this will crash if no key_fields
            key = tuple(sorted(rec.items()))
        if key not in seen:
            seen.add(key)
            result.append(rec)
    return result
