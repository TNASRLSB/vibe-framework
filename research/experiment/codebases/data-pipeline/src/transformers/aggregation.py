"""Data aggregation transforms: TF-12 through TF-13."""
from collections import defaultdict


def group_by_field(records, config):
    """TF-12: Group records by a specified field."""
    field = config.get("field", "category")
    agg_field = config.get("agg_field", "amount")
    agg_func = config.get("agg_func", "sum")  # sum | count | avg

    groups = defaultdict(list)
    for rec in records:
        key = rec.get(field, "unknown")
        groups[key].append(rec)

    result = []
    for key, group in groups.items():
        values = []
        for rec in group:
            val = rec.get(agg_field)
            if val is not None:
                try:
                    values.append(float(val))
                except (ValueError, TypeError):
                    pass

        agg_value = 0
        if agg_func == "sum":
            agg_value = sum(values)
        elif agg_func == "count":
            agg_value = len(group)
        elif agg_func == "avg" and values:
            agg_value = sum(values) / len(values)

        result.append({
            field: key,
            f"{agg_field}_{agg_func}": round(agg_value, 2),
            "record_count": len(group),
        })
    return result


def compute_summary(records, config):
    """TF-13: Compute summary statistics across all records."""
    fields = config.get("fields", [])

    summary = {}
    for field in fields:
        values = []
        for rec in records:
            val = rec.get(field)
            if val is not None:
                try:
                    values.append(float(val))
                except (ValueError, TypeError):
                    pass
        if values:
            summary[field] = {
                "count": len(values),
                "sum": round(sum(values), 2),
                "min": min(values),
                "max": max(values),
                "avg": round(sum(values) / len(values), 2),
            }

    # SMELL-09: returns summary dict, breaking the list[dict] contract
    return [{"_summary": summary, "_record_count": len(records)}]
