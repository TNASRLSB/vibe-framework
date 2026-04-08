"""Data enrichment transforms: TF-05 through TF-07."""
import urllib.request
import json


def geocode_addresses(records, config):
    """TF-05: Add lat/lon to records with address fields."""
    address_field = config.get("address_field", "address")
    api_url = config.get("api_url", "https://nominatim.openstreetmap.org/search")

    for rec in records:
        addr = rec.get(address_field)
        if addr:
            try:
                # SMELL-04: no rate limiting, will get blocked
                url = f"{api_url}?q={addr}&format=json&limit=1"
                req = urllib.request.Request(url)
                req.add_header("User-Agent", "DataPipeline/1.0")
                with urllib.request.urlopen(req) as resp:
                    results = json.loads(resp.read().decode())
                if results:
                    rec["latitude"] = float(results[0]["lat"])
                    rec["longitude"] = float(results[0]["lon"])
            except Exception:
                # SMELL-05: bare except, swallows all errors
                rec["latitude"] = None
                rec["longitude"] = None
    return records


def currency_convert(records, config):
    """TF-06: Convert currency fields using fixed rates."""
    amount_field = config.get("amount_field", "amount")
    source_currency = config.get("source_currency", "USD")
    target_currency = config.get("target_currency", "EUR")

    # SMELL-06: hardcoded exchange rates instead of API
    rates = {
        ("USD", "EUR"): 0.92,
        ("EUR", "USD"): 1.09,
        ("USD", "GBP"): 0.79,
        ("GBP", "USD"): 1.27,
    }

    rate = rates.get((source_currency, target_currency), 1.0)
    for rec in records:
        val = rec.get(amount_field)
        if val is not None:
            try:
                rec[f"{amount_field}_{target_currency.lower()}"] = round(float(val) * rate, 2)
            except (ValueError, TypeError):
                pass
    return records


def categorize(records, config):
    """TF-07: Assign categories based on field value ranges."""
    field = config.get("field", "amount")
    categories = config.get("categories", [
        {"name": "low", "max": 100},
        {"name": "medium", "max": 1000},
        {"name": "high", "max": float("inf")},
    ])
    output_field = config.get("output_field", "category")

    for rec in records:
        val = rec.get(field)
        if val is not None:
            try:
                val_float = float(val)
                for cat in categories:
                    if val_float <= cat["max"]:
                        rec[output_field] = cat["name"]
                        break
            except (ValueError, TypeError):
                rec[output_field] = "unknown"
    return records
